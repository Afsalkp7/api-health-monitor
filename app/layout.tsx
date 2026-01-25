import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // Import the wrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Next App",
  description: "Built with Next.js and Custom Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything in Providers so useSession works everywhere */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}