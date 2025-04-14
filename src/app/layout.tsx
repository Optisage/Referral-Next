import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { ReferralProvider } from '@/context/ReferralContext';
import Header from '@/components/Header';
import ClientOnly from '@/components/ClientOnly';
import NavigationProgress from '@/components/NavigationProgress';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "optisage Referral Manager",
  description: "WhatsApp Group Referral System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This is a client component so we can't use usePathname here
  // We'll conditionally render the Header in the Header component itself
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <AuthProvider>
            <ReferralProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <NavigationProgress />
                <main className="flex-grow">
                  {children}
                </main>
              </div>
            </ReferralProvider>
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
