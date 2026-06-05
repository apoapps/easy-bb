import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'easy-bb by apoapps',
  description: 'Blackboard metrics dashboard with a Next.js backend, built by apoapps.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
