import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'easy-bb',
  description: 'Dashboard web para Blackboard.',
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
