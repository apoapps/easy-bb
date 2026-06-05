'use client';

import dynamic from 'next/dynamic';
import { ShellSkeleton } from '../src/components/Skeleton';

const ClientOnlyApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <ShellSkeleton />,
});

export function ClientApp() {
  return <ClientOnlyApp />;
}
