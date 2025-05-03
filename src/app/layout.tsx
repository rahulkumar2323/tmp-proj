import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import path
import { GeistMono } from 'geist/font/mono'; // Corrected import path
import './globals.css';

// No need to call the font functions here, just use the imported class names directly if needed
// The variables are set globally via the import.

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
    // Apply the font variables to the html tag for global scope
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      {/* Apply the base font style to body */}
      <body className="font-sans antialiased flex flex-col min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
