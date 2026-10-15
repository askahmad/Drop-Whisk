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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://dropwhisk.com"
  ),
  title: {
    default: "Drop Whisk — Instant Cross-Device File & Text Sharing",
    template: "%s | Drop Whisk",
  },
  description:
    "Transfer files, images, videos, audio, and text between iPhone, Android, Windows, Mac, and Linux in seconds. Zero sign-up, no cables, 500MB per file, temporary 24h rooms.",
  keywords: [
    "drop whisk",
    "dropwhisk",
    "airdrop alternative",
    "airdrop for windows and android",
    "cross-device file transfer",
    "instant file sharing",
    "share files pc to mobile",
    "qr code file transfer",
    "no login file share",
    "send large files free",
    "temporary file sharing",
    "online clipboard sync",
  ],
  authors: [{ name: "Muhammad Ahmad", url: "https://connexode.com" }],
  creator: "Muhammad Ahmad (Founder of Connexode)",
  publisher: "Connexode",
  category: "technology",
  applicationName: "Drop Whisk",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Drop Whisk — Instant Cross-Device File & Text Sharing",
    description:
      "Share images, videos, audio and any file between mobile, PC, Android and iPhone in seconds. No login, no setup.",
    url: "https://dropwhisk.com",
    siteName: "Drop Whisk",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drop Whisk — Instant Cross-Device File & Text Sharing",
    description:
      "Share files across iPhone, Android, Windows, and Mac in seconds with QR codes or room codes. Zero sign-up.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://dropwhisk.com/#webapp",
      name: "Drop Whisk",
      url: "https://dropwhisk.com",
      description:
        "Instant, secure cross-device file & text sharing without sign-ups or cables. Works between iOS, Android, Windows, macOS, and Linux.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "No sign-up or registration required",
        "Cross-device transfer between iOS, Android, Windows, macOS, and Linux",
        "Instant QR code and 6-digit room code connection",
        "Real-time device presence and live sync",
        "Up to 500MB per file transfer",
        "Auto-expiring 24-hour temporary rooms",
        "Single-click ZIP archive download",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://dropwhisk.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I transfer files between phone and PC with Drop Whisk?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open Drop Whisk on your PC or phone, click 'Create room', and scan the generated QR code or enter the 6-digit code on your other device. Then drag and drop files or copy-paste text to transfer instantly.",
          },
        },
        {
          "@type": "Question",
          name: "Is Drop Whisk free to use and do I need to register?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Drop Whisk is 100% free with zero sign-up, no email registration, and no software installation required.",
          },
        },
        {
          "@type": "Question",
          name: "What file types and sizes are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can share photos, videos, audio, PDF documents, archives, and raw files up to 500MB per file.",
          },
        },
        {
          "@type": "Question",
          name: "How long are uploaded files and rooms kept?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All rooms, uploaded files, and clipboard snippets are automatically deleted after 24 hours for your privacy and security.",
          },
        },
        {
          "@type": "Question",
          name: "Does Drop Whisk work across different operating systems?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, it works seamlessly across iPhone (iOS), Android, Windows, macOS, and Linux via any modern web browser.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="schema-org-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
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
