import { envSchema } from '../validation/schemas';
import { SecurityLoggerService } from '../services/securityLogger';

/**
 * Validate and parse environment variables on startup
 */
function validateEnvironment() {
  try {
    const env = envSchema.parse(process.env);
    
    // Log successful environment validation
    SecurityLoggerService.logSuccess({
      event: 'ENVIRONMENT_VALIDATION_SUCCESS',
      severity: 'LOW',
      details: {
        nodeEnv: env.NODE_ENV,
        port: env.PORT,
        hasDatabase: !!env.DATABASE_URL,
        hasJwtSecret: !!env.JWT_SECRET,
        hasStripeKeys: !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
        hasSendGrid: !!env.SENDGRID_API_KEY,
        hasRedis: !!(env.REDIS_HOST && env.REDIS_PORT),
      },
    });
    
    return env;
  } catch (error) {
    // Log critical environment validation failure
    SecurityLoggerService.logSecurityError({
      event: 'ENVIRONMENT_VALIDATION_FAILED',
      severity: 'CRITICAL',
      details: {
        error: error instanceof Error ? error.message : 'Unknown validation error',
        missingOrInvalid: error instanceof Error && 'issues' in error 
          ? (error as any).issues?.map((issue: any) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })) 
          : 'Unknown issues',
      },
      error: error instanceof Error ? error : undefined,
    });

    console.error('❌ Environment validation failed:');
    if (error instanceof Error && 'issues' in error) {
      (error as any).issues?.forEach((issue: any) => {
        console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
      });
    } else {
      console.error(`  • ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.error('\n📋 Required environment variables:');
    console.error('  • DATABASE_URL: PostgreSQL connection string');
    console.error('  • JWT_SECRET: Secret key for JWT tokens (min 32 chars)');
    console.error('  • STRIPE_SECRET_KEY: Stripe secret key (starts with sk_)');
    console.error('  • STRIPE_WEBHOOK_SECRET: Stripe webhook secret (starts with whsec_)');
    console.error('  • SENDGRID_API_KEY: SendGrid API key (starts with SG.)');
    console.error('\n🔧 Optional environment variables:');
    console.error('  • NODE_ENV: development|production|test (default: development)');
    console.error('  • PORT: Server port (default: 4000)');
    console.error('  • REDIS_HOST: Redis hostname (default: localhost)');
    console.error('  • REDIS_PORT: Redis port (default: 6379)');
    console.error('  • REDIS_PASSWORD: Redis password (optional)');
    
    process.exit(1);
  }
}

/**
 * Validated environment configuration
 */
export const env = validateEnvironment();

/**
 * Security-focused environment checks
 */
export function performSecurityChecks() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for production readiness
  if (env.NODE_ENV === 'production') {
    // JWT Secret strength
    if (env.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET should be at least 64 characters in production');
    }
    
    // Check for development/test values
    if (env.JWT_SECRET.includes('your-secret-key') || env.JWT_SECRET.includes('change')) {
      errors.push('JWT_SECRET appears to be a default/placeholder value');
    }
    
    if (env.STRIPE_SECRET_KEY.includes('test')) {
      warnings.push('Using Stripe test keys in production environment');
    }
    
    // Database security
    if (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1')) {
      warnings.push('Database appears to be running locally in production');
    }
    
    if (!env.DATABASE_URL.includes('ssl=true') && !env.DATABASE_URL.includes('sslmode=require')) {
      warnings.push('Database connection may not be using SSL');
    }
  }
  
  // Check Redis configuration
  if (env.NODE_ENV === 'production' && !env.REDIS_PASSWORD) {
    warnings.push('Redis is not password protected in production');
  }
  
  // Log security findings
  if (errors.length > 0) {
    SecurityLoggerService.logSecurityError({
      event: 'ENVIRONMENT_SECURITY_ERRORS',
      severity: 'CRITICAL',
      details: {
        errors,
        nodeEnv: env.NODE_ENV,
      },
    });
    
    console.error('🚨 Critical environment security issues:');
    errors.forEach(error => console.error(`  • ${error}`));
    
    if (env.NODE_ENV === 'production') {
      console.error('\n❌ Cannot start in production with security errors');
      process.exit(1);
    }
  }
  
  if (warnings.length > 0) {
    SecurityLoggerService.logSuccess({
      event: 'ENVIRONMENT_SECURITY_WARNINGS',
      severity: 'MEDIUM',
      details: {
        warnings,
        nodeEnv: env.NODE_ENV,
      },
    });
    
    console.warn('⚠️  Environment security warnings:');
    warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    SecurityLoggerService.logSuccess({
      event: 'ENVIRONMENT_SECURITY_CHECK_PASSED',
      severity: 'LOW',
      details: {
        nodeEnv: env.NODE_ENV,
        checksPerformed: [
          'jwt_secret_strength',
          'default_values_check',
          'stripe_key_validation',
          'database_ssl_check',
          'redis_auth_check'
        ],
      },
    });
    
    console.log('✅ Environment security checks passed');
  }
}

/**
 * Runtime configuration validation
 */
export function validateRuntimeConfig() {
  // Check if required services are accessible
  const checks = [
    {
      name: 'Database Connection',
      required: true,
      check: () => !!env.DATABASE_URL,
    },
    {
      name: 'JWT Configuration',
      required: true,
      check: () => env.JWT_SECRET.length >= 32,
    },
    {
      name: 'Stripe Configuration',
      required: true,
      check: () => env.STRIPE_SECRET_KEY.startsWith('sk_') && env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_'),
    },
    {
      name: 'SendGrid Configuration',
      required: true,
      check: () => env.SENDGRID_API_KEY.startsWith('SG.'),
    },
    {
      name: 'Redis Configuration',
      required: false,
      check: () => !!env.REDIS_HOST && !!env.REDIS_PORT,
    },
  ];
  
  const failed = checks.filter(check => check.required && !check.check());
  
  if (failed.length > 0) {
    SecurityLoggerService.logSecurityError({
      event: 'RUNTIME_CONFIG_VALIDATION_FAILED',
      severity: 'CRITICAL',
      details: {
        failedChecks: failed.map(check => check.name),
        nodeEnv: env.NODE_ENV,
      },
    });
    
    console.error('❌ Runtime configuration validation failed:');
    failed.forEach(check => console.error(`  • ${check.name} validation failed`));
    process.exit(1);
  }
  
  console.log('✅ Runtime configuration validation passed');
}