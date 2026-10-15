import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftDrop — Share files across any device, instantly",
  description:
    "SwiftDrop lets you share images, videos, audio and any file between mobile, PC, Android and iPhone in seconds. No login, no limits — just a room code or a QR scan.",
  keywords: [
    "file sharing",
    "share files",
    "airdrop",
    "qr share",
    "cross-device transfer",
    "mobile to pc",
    "send video",
    "send images",
  ],
  authors: [{ name: "SwiftDrop" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SwiftDrop — Share files across any device, instantly",
    description:
      "Share images, videos, audio and any file between mobile, PC, Android and iPhone in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
