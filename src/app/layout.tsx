import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annapurna Future Financial Services Nidhi Limited | AFS",
  description: "Building Financial Confidence. Securing Your Future. Member-based financial and loan management platform.",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F5F7FB] text-[#17243A] antialiased">
        {children}
      </body>
    </html>
  );
}
