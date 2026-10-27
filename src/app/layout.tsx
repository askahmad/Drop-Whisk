import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dropwhisk.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Drop Whisk — Fast, Free Cross-Device File & Text Sharing (AirDrop for Android & PC)",
    template: "%s | Drop Whisk",
  },
  description:
    "Transfer files, images, 4K videos, audio, and clipboard text between iPhone, Android, Windows, Mac, and Linux in seconds. Zero sign-up, no cables, 500MB per file, temporary 24h auto-expiring rooms.",
  keywords: [
    "drop whisk",
    "dropwhisk",
    "airdrop alternative",
    "airdrop for windows",
    "airdrop for android",
    "cross-device file transfer",
    "instant file sharing",
    "share files pc to mobile",
    "share files iphone to pc",
    "transfer files android to mac",
    "qr code file transfer",
    "no login file share",
    "send large files free",
    "500mb file transfer free",
    "temporary file sharing",
    "online clipboard sync",
    "browser file transfer",
    "p2p file sharing web",
    "snapdrop alternative",
    "wetransfer alternative without email",
    "muhammad ahmad connexode",
    "connexode drop whisk",
  ],
  authors: [{ name: "Muhammad Ahmad", url: "https://connexode.com" }],
  creator: "Muhammad Ahmad (Founder of Connexode)",
  publisher: "Connexode",
  category: "Utilities / File Sharing / Productivity",
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
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Drop Whisk — Fast Cross-Device File & Text Sharing (AirDrop Alternative)",
    description:
      "Share photos, 4K videos, audio, documents, and clipboard text between iPhone, Android, Windows, Mac, and Linux in seconds. No login, no apps, 500MB per file.",
    url: APP_URL,
    siteName: "Drop Whisk",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Drop Whisk — Instant Cross-Device File & Text Sharing",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drop Whisk — Instant Cross-Device File & Text Sharing",
    description:
      "Share files across iPhone, Android, Windows, and Mac in seconds with QR codes or room codes. Zero sign-up, 500MB per file.",
    images: ["/opengraph-image"],
    creator: "@askahmad",
    site: "@askahmad",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Drop Whisk",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#webapp`,
      name: "Drop Whisk",
      url: APP_URL,
      description:
        "Instant, secure cross-device file & text sharing without sign-ups or cables. Works across iOS, Android, Windows, macOS, Linux, and ChromeOS.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Windows, macOS, Linux, iOS, Android, ChromeOS",
      browserRequirements: "Requires HTML5 and JavaScript. Compatible with Chrome, Safari, Firefox, Edge, Brave, Opera.",
      softwareVersion: "0.2.1",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "128",
        bestRating: "5",
        worstRating: "1",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      screenshot: `${APP_URL}/opengraph-image`,
      creator: {
        "@type": "Person",
        "@id": "https://connexode.com/#ahmad",
        name: "Muhammad Ahmad",
        url: "https://connexode.com",
        jobTitle: "Founder of Connexode",
      },
      publisher: {
        "@type": "Organization",
        "@id": "https://connexode.com/#organization",
        name: "Connexode",
        url: "https://connexode.com",
      },
      featureList: [
        "Zero sign-up or user account registration required",
        "Universal cross-device transfer between iOS, Android, Windows, macOS, and Linux",
        "Instant QR code pairing via smartphone camera",
        "6-character quick join room codes",
        "Real-time WebSocket device presence and sync",
        "Up to 500MB per file transfer support",
        "Auto-expiring 24-hour temporary rooms for complete privacy",
        "Single-click streaming ZIP archive download",
        "Live clipboard text sharing with instant copy",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://connexode.com/#organization",
      name: "Connexode",
      url: "https://connexode.com",
      founder: {
        "@id": "https://connexode.com/#ahmad",
      },
      sameAs: [
        "https://github.com/askahmad",
        "https://github.com/askahmad/Drop-Whisk",
      ],
    },
    {
      "@type": "Person",
      "@id": "https://connexode.com/#ahmad",
      name: "Muhammad Ahmad",
      url: "https://connexode.com",
      jobTitle: "Founder & Software Engineer",
      worksFor: {
        "@id": "https://connexode.com/#organization",
      },
      sameAs: [
        "https://connexode.com",
        "https://github.com/askahmad",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: "Drop Whisk",
      description: "Fast, Free Cross-Device File & Text Sharing",
      inLanguage: "en-US",
      publisher: {
        "@id": "https://connexode.com/#organization",
      },
    },
    {
      "@type": "HowTo",
      "@id": `${APP_URL}/#howto`,
      name: "How to transfer files between phone and PC with Drop Whisk",
      description: "Quick 3-step guide to wirelessly share files, photos, videos, and text across iOS, Android, PC, and Mac without apps or registration.",
      totalTime: "PT1M",
      tool: [
        {
          "@type": "HowToTool",
          name: "Any modern web browser (Chrome, Safari, Edge, Firefox)",
        },
      ],
      step: [
        {
          "@type": "HowToStep",
          url: `${APP_URL}/#step1`,
          name: "Create a Room",
          itemListElement: [
            {
              "@type": "HowToDirection",
              text: "Open Drop Whisk on your computer or phone and click 'Create room'. You will receive a unique 6-character room code and a pairing QR code.",
            },
          ],
        },
        {
          "@type": "HowToStep",
          url: `${APP_URL}/#step2`,
          name: "Connect Your Second Device",
          itemListElement: [
            {
              "@type": "HowToDirection",
              text: "Open your smartphone camera and scan the displayed QR code, or open Drop Whisk on another device and enter the 6-character code.",
            },
          ],
        },
        {
          "@type": "HowToStep",
          url: `${APP_URL}/#step3`,
          name: "Drop and Download Files",
          itemListElement: [
            {
              "@type": "HowToDirection",
              text: "Drag and drop files up to 500MB or paste text snippets. Files immediately appear on all paired devices with instant one-click download or single ZIP archive export.",
            },
          ],
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${APP_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I transfer files between phone and PC with Drop Whisk?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open Drop Whisk on your PC or phone, click 'Create room', and scan the generated QR code or enter the 6-digit code on your other device. Then drag and drop files or copy-paste text to transfer instantly without cables.",
          },
        },
        {
          "@type": "Question",
          name: "Is Drop Whisk free to use and do I need to register?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Drop Whisk is 100% free with zero sign-up, no email registration, and no software installation required. Simply open the website in your browser and start transferring immediately.",
          },
        },
        {
          "@type": "Question",
          name: "What file types and sizes are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Drop Whisk supports all file types including photos (JPEG, PNG, HEIC, RAW), videos (MP4, MOV, MKV up to 4K), audio, PDF documents, archives, and code files up to 500MB per file.",
          },
        },
        {
          "@type": "Question",
          name: "How long are uploaded files and rooms kept?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All rooms, uploaded files, and clipboard snippets are temporary and automatically deleted after 24 hours for your privacy and security. No persistent user data is retained.",
          },
        },
        {
          "@type": "Question",
          name: "Does Drop Whisk work across different operating systems?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Drop Whisk works seamlessly across iPhone (iOS), Android, Windows, macOS, Linux, and ChromeOS via any modern web browser like Chrome, Safari, Edge, or Firefox.",
          },
        },
        {
          "@type": "Question",
          name: "How is Drop Whisk better than Apple AirDrop or Google Quick Share?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AirDrop is locked to Apple devices, and Quick Share is locked to Android/Windows. Drop Whisk is truly universal: it bridges Apple, Android, Windows, and Linux without installing apps, Bluetooth configuration, or vendor lock-in.",
          },
        },
        {
          "@type": "Question",
          name: "Is Drop Whisk secure and private?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Drop Whisk uses encrypted HTTPS/WSS connections, requires no personal accounts or email addresses, stores files in temporary isolated rooms, and automatically purges all data after 24 hours.",
          },
        },
        {
          "@type": "Question",
          name: "Who developed Drop Whisk?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Drop Whisk was developed by Muhammad Ahmad, Founder of Connexode. It was built as a modern, high-speed, open-source tool to eliminate cross-device sharing barriers.",
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
