import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { THOFNAA_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${THOFNAA_CONFIG.name} - Student Payment Verification Portal`,
  description: "Official online payment proof verification portal for THOFNAA INSTITUTE Sinhala tuition fees.",
  keywords: ["THOFNAA", "Sinhala Tuition", "Payment Verification", "Student Registration", "Tuition Receipt"],
  icons: {
    icon: "/thofnaa-logo.png",
    shortcut: "/thofnaa-logo.png",
    apple: "/thofnaa-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-thofnaa-ivory text-thofnaa-charcoal antialiased selection:bg-thofnaa-gold/30 selection:text-thofnaa-navy" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
