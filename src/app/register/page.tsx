'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    const path = role ? `/auth?mode=register&role=${role}` : '/auth?mode=register';
    router.replace(path);
  }, [router, searchParams]);

  return <div className="min-h-screen bg-white" />;
}
