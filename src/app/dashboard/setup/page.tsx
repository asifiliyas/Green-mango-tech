'use client';

import { useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function SetupContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get('role');

  useEffect(() => {
    async function syncRole() {
      if (status === 'authenticated' && session?.user && requestedRole) {
        // If the user's current role is the default BUYER and they asked for SELLER
        if ((session.user as any).role === 'BUYER' && requestedRole === 'SELLER') {
          try {
            const res = await fetch('/api/auth/sync-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: requestedRole })
            });
            if (res.ok) {
              // Reload session to get the new role
              window.location.href = '/dashboard';
            } else {
              router.push('/dashboard');
            }
          } catch (err) {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } else if (status === 'unauthenticated') {
        router.push('/login');
      } else if (status === 'authenticated' && !requestedRole) {
        router.push('/dashboard');
      }
    }

    if (status !== 'loading') {
      syncRole();
    }
  }, [status, session, requestedRole, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Syncing your workspace...</h2>
      <p className="text-gray-500 font-medium">Ensuring your identity is production-ready.</p>
    </div>
  );
}

export default function DashboardSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>}>
      <SetupContent />
    </Suspense>
  );
}
