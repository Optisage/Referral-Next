import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { ReferralProvider } from '@/context/ReferralContext';
import Header from '@/components/Header';
import ClientOnly from '@/components/ClientOnly';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OptSage Referral Manager",
  description: "WhatsApp Group Referral System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <AuthProvider>
            <ReferralProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
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
