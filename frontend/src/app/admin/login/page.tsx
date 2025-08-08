'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ADMIN_LOGIN } from '@/lib/graphql/mutations';
import { AdminLoginFormData } from '@/lib/types';
import { setAdminToken, getErrorMessage, isAdminTokenValid, sanitizeEmail, sanitizeString } from '@/lib/utils';
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  
  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN);

  // Check if user is already logged in
  useEffect(() => {
    if (isAdminTokenValid()) {
      router.push('/admin/dashboard');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AdminLoginFormData>();

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      // Sanitize form data
      const sanitizedData = {
        email: sanitizeEmail(data.email),
        password: sanitizeString(data.password),
      };

      const result = await adminLogin({
        variables: {
          input: {
            email: sanitizedData.email,
            password: sanitizedData.password,
          },
        },
      });

      if (result.data?.adminLogin) {
        const { token, admin } = result.data.adminLogin;
        setAdminToken(token);
        
        // Store admin info in localStorage for dashboard
        localStorage.setItem('admin-info', JSON.stringify(admin));
        
        // Redirect to dashboard
        router.push('/admin/dashboard');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError('root', {
        type: 'manual',
        message: getErrorMessage(error),
      });
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info-600"></div>
        <p className="mt-4 text-secondary-600">Overujem prihlásenie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-secondary-900">
              Luxury Hotel
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Späť na hotel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto mt-10 sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-info-600 rounded-full flex items-center justify-center">
            <LockIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Prihlásenie personálu
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Prístup do systému správy hotela
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Emailová adresa
              </label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@hotel.com"
                  {...register('email', {
                    required: 'Email je povinný',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Zadajte platný email',
                    },
                  })}
                  error={errors.email?.message}
                />
                <UserIcon className="absolute right-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Heslo
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Zadajte vaše heslo"
                  {...register('password', {
                    required: 'Heslo je povinné',
                    minLength: {
                      value: 6,
                      message: 'Heslo musí mať aspoň 6 znakov',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-error-50 border border-error-200 rounded-md p-3">
                <p className="text-sm text-error-800">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Prihlásiť sa
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-secondary-500">
                  Demo prihlasovacie údaje
                </span>
              </div>
            </div>

            <div className="mt-4 text-sm text-secondary-600 bg-secondary-50 rounded-md p-3">
              <p className="font-medium mb-2">Pre testovanie:</p>
              <p>Email: admin@hotel.com</p>
              <p>Heslo: admin123</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-secondary-500">
          Toto je bezpečná oblasť len pre personál hotela
        </p>
      </div>
    </div>
  );
}