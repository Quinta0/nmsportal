import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NMS Portal Address Tool",
  description: "Generate and share portal addresses for No Man's Sky",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <AuthProvider>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </AuthProvider>
      </body>
      </html>
  );
}
