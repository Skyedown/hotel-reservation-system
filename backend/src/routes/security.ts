/**
 * Security violation reporting endpoints
 * 
 * Handles CSP, Trusted Types, and other security violation reports
 * from the frontend for monitoring and analysis.
 */

import { Router, Request, Response } from 'express';
import { SecurityLoggerService } from '../services/securityLogger';

const router = Router();

/**
 * Interface for CSP violation reports
 */
interface CSPViolationReport {
  type: 'csp-violation';
  blockedURI?: string;
  violatedDirective?: string;
  originalPolicy?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: string;
}

/**
 * Interface for Trusted Types violation reports
 */
interface TrustedTypesViolationReport {
  type: 'trusted-types-violation';
  policyName?: string;
  violationType?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  sampleValue?: string;
  timestamp: string;
}

/**
 * Interface for XSS prevention reports
 */
interface XSSPreventionReport {
  type: 'xss-prevention';
  preventionType: string;
  blockedContent?: string;
  sourceFile?: string;
  context?: string;
  timestamp: string;
}

/**
 * CSP violation reporting endpoint
 */
router.post('/csp-violations', (req: Request, res: Response) => {
  try {
    const report: CSPViolationReport = req.body;
    
    // Validate report structure
    if (!report.type || report.type !== 'csp-violation') {
      return res.status(400).json({ error: 'Invalid CSP violation report format' });
    }

    // Log the CSP violation
    SecurityLoggerService.logCSPViolation({
      event: 'CSP_DIRECTIVE_VIOLATED',
      severity: 'MEDIUM',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        blockedURI: report.blockedURI,
        violatedDirective: report.violatedDirective,
        originalPolicy: report.originalPolicy,
        sourceFile: report.sourceFile,
        lineNumber: report.lineNumber,
        columnNumber: report.columnNumber,
      },
      metadata: {
        reportTimestamp: report.timestamp,
        referer: req.get('Referer'),
      }
    });

    // Check for critical violations that need immediate attention
    const criticalDirectives = ['script-src', 'trusted-types', 'require-trusted-types-for'];
    const isCritical = criticalDirectives.some(directive => 
      report.violatedDirective?.includes(directive)
    );

    if (isCritical) {
      SecurityLoggerService.logSuspiciousActivity({
        event: 'CRITICAL_CSP_VIOLATION',
        severity: 'HIGH',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          reason: 'Critical CSP directive violated',
          violatedDirective: report.violatedDirective,
          blockedURI: report.blockedURI,
        }
      });
    }

    res.status(204).send(); // No content response as per CSP spec
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    res.status(500).json({ error: 'Failed to process violation report' });
  }
});

/**
 * Trusted Types violation reporting endpoint
 */
router.post('/trusted-types-violations', (req: Request, res: Response) => {
  try {
    const report: TrustedTypesViolationReport = req.body;
    
    // Validate report structure
    if (!report.type || report.type !== 'trusted-types-violation') {
      return res.status(400).json({ error: 'Invalid Trusted Types violation report format' });
    }

    // Log the Trusted Types violation
    SecurityLoggerService.logTrustedTypesViolation({
      event: 'TRUSTED_TYPES_POLICY_VIOLATION',
      severity: 'HIGH', // Trusted Types violations are always high severity
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        policyName: report.policyName,
        violationType: report.violationType,
        sourceFile: report.sourceFile,
        lineNumber: report.lineNumber,
        columnNumber: report.columnNumber,
        sampleValue: report.sampleValue ? report.sampleValue.substring(0, 200) : undefined, // Truncate for security
      },
      metadata: {
        reportTimestamp: report.timestamp,
        referer: req.get('Referer'),
      }
    });

    // All Trusted Types violations are considered security incidents
    SecurityLoggerService.logSuspiciousActivity({
      event: 'POTENTIAL_XSS_ATTEMPT',
      severity: 'CRITICAL',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        reason: 'Trusted Types policy violation detected',
        policyName: report.policyName,
        sourceFile: report.sourceFile,
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error processing Trusted Types violation report:', error);
    res.status(500).json({ error: 'Failed to process violation report' });
  }
});

/**
 * XSS prevention reporting endpoint
 */
router.post('/xss-prevention', (req: Request, res: Response) => {
  try {
    const report: XSSPreventionReport = req.body;
    
    // Validate report structure
    if (!report.type || report.type !== 'xss-prevention') {
      return res.status(400).json({ error: 'Invalid XSS prevention report format' });
    }

    // Log the XSS prevention event
    SecurityLoggerService.logXSSPrevention({
      event: 'XSS_ATTEMPT_BLOCKED',
      severity: 'MEDIUM',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        preventionType: report.preventionType,
        blockedContent: report.blockedContent ? report.blockedContent.substring(0, 100) : undefined, // Truncate for security
        sourceFile: report.sourceFile,
        context: report.context,
      },
      metadata: {
        reportTimestamp: report.timestamp,
        referer: req.get('Referer'),
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error processing XSS prevention report:', error);
    res.status(500).json({ error: 'Failed to process violation report' });
  }
});

/**
 * COOP violation reporting endpoint
 */
router.post('/coop-violations', (req: Request, res: Response) => {
  try {
    const report = req.body;
    
    SecurityLoggerService.logSuspiciousActivity({
      event: 'COOP_VIOLATION',
      severity: 'HIGH',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        ...report,
      },
      metadata: {
        reportTimestamp: new Date().toISOString(),
        referer: req.get('Referer'),
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error processing COOP violation report:', error);
    res.status(500).json({ error: 'Failed to process violation report' });
  }
});

/**
 * COEP violation reporting endpoint
 */
router.post('/coep-violations', (req: Request, res: Response) => {
  try {
    const report = req.body;
    
    SecurityLoggerService.logSuspiciousActivity({
      event: 'COEP_VIOLATION',
      severity: 'MEDIUM',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        ...report,
      },
      metadata: {
        reportTimestamp: new Date().toISOString(),
        referer: req.get('Referer'),
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error processing COEP violation report:', error);
    res.status(500).json({ error: 'Failed to process violation report' });
  }
});

/**
 * Security dashboard endpoint (admin only)
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    // This would typically aggregate security logs and provide dashboard data
    // For now, return basic status
    res.json({
      status: 'Security monitoring active',
      trustedTypes: {
        enabled: true,
        policy: 'hotel-system-policy',
      },
      csp: {
        enabled: true,
        enforced: true,
      },
      reporting: {
        endpoints: [
          '/api/security/csp-violations',
          '/api/security/trusted-types-violations',
          '/api/security/xss-prevention',
          '/api/security/coop-violations',
          '/api/security/coep-violations'
        ]
      }
    });
  } catch (error) {
    console.error('Error retrieving security dashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve security dashboard' });
  }
});

/**
 * Security health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    securityFeatures: {
      trustedTypes: true,
      csp: true,
      coop: true,
      xssPrevention: true,
    }
  });
});

export default router;