import type { Metadata } from "next";
import { Inter, Bangers, Comic_Neue } from "next/font/google";
import "./globals.css";
import { AntiInspectShield } from "@/components/security/AntiInspectShield";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const comicNeue = Comic_Neue({
  variable: "--font-comic",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Create Comic | Comic Creator App",
  description: "Create epic comics with AI. Design characters, generate scenes, lay out pages, and publish graphic novels.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bangers.variable} ${comicNeue.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090D16] text-[#F1F5F9] selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]">
        <AntiInspectShield />
        {children}
      </body>
    </html>
  );
}
