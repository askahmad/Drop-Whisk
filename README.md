# ⚡ Drop Whisk

> **Instant, secure cross-device file & text sharing without sign-ups or cables.**

Drop Whisk enables lightning-fast file sharing across phones, laptops, tablets, Android, iOS, Windows, macOS, and Linux. Simply create a temporary room, scan the QR code or enter a 6-character room code, and share files, images, videos, audio, and text in real-time.

---

## ✨ Features

- **⚡ Zero Setup / No Accounts**: No email, no passwords, no registration. Create a room and share immediately.
- **📱 True Cross-Device**: Seamless transfer between iOS, Android, Windows, Mac, and Linux.
- **📷 Instant QR Code & Room Codes**: Scan with your smartphone camera to connect to the session in under 2 seconds.
- **🔄 Real-Time Presence & Sync**: Instant awareness of connected devices in the room, live message feed, and real-time upload announcements.
- **📦 Multi-File & ZIP Download**: Download individual files or package all room files into a single `.zip` archive on demand.
- **⏳ Auto-Expiring Rooms**: Temporary 24-hour lifetime keeps file storage clean and secure.
- **🌓 Dark & Light Theme**: Polished modern UI with glassmorphism, fluid micro-animations, and full dark/light mode support.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Route Handlers)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), Radix UI, Framer Motion, Lucide Icons
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite
- **Real-Time Communication**: [Socket.io](https://socket.io/) (real-time signaling mini-service)
- **Runtime**: Node.js v20+ / Bun

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.0.0 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 1. Clone the repository

```bash
git clone https://github.com/askahmad/Drop-Whisk.git
cd Drop-Whisk
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Setup environment & database

Copy the example environment configuration:

```bash
cp .env.example .env
```

Generate Prisma client and initialize SQLite database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Optional)* Start the real-time websocket mini-service for multi-device live sync:

```bash
npx tsx mini-services/share-service/index.ts
```

---

## 📁 Project Structure

```text
dropwhisk/
├── db/                       # SQLite database files
├── mini-services/
│   └── share-service/        # Socket.io real-time signaling service
├── prisma/
│   └── schema.prisma         # Database schema (Room, File, TextSnippet, Device)
├── public/                   # Static assets & favicons
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API route handlers (rooms, files, texts, zip)
│   │   ├── globals.css       # Tailwind & custom tokens
│   │   ├── layout.tsx        # Root layout, metadata & fonts
│   │   └── page.tsx          # Main entry (Landing & Room views)
│   ├── components/
│   │   ├── share/            # Drop Whisk components (header, upload, qr, files, chat)
│   │   └── ui/               # Radix UI primitive components
│   └── lib/                  # Stores (Zustand), API client, types & utilities
└── storage/
    └── uploads/              # Local disk storage for uploaded files
```

---

## 🔒 Security & Privacy

- Files and rooms auto-expire after 24 hours.
- Room codes are randomly generated and short-lived.
- No personal data or user accounts are stored.

---

## 📄 License

MIT License. Built with ❤️ for fast cross-device workflows.
