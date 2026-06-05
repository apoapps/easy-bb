'use client';

import dynamic from 'next/dynamic';

const ClientOnlyApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center bg-bg">
      <div className="font-display text-2xl">BB DASH</div>
    </div>
  ),
});

export function ClientApp() {
  return <ClientOnlyApp />;
}
