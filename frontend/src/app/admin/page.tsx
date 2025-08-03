'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminTokenValid } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAdminTokenValid()) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info-600"></div>
      <p className="mt-4 text-secondary-600">Redirecting...</p>
    </div>
  );
}