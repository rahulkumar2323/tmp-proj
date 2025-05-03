import type { Metadata } from 'next';
import { Geist_Sans as GeistSans, Geist_Mono as GeistMono } from 'next/font/google'; // Correct import
import './globals.css';

const geistSans = GeistSans({ // Correct usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GoalGetter - Track Your Progress',
  description: 'Set personal or team goals and track progress with GoalGetter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
