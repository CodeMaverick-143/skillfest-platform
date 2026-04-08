import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { EventGate } from "@/components/event-gate";
import { ConditionalChrome } from "../components/conditional-chrome";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SkillFest 2026 | Build. Contribute. Grow.",
  description: "Join the ultimate open source challenge. Contribute to nst-sdc repositories and level up your engineering skills.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased selection:bg-white/20 selection:text-white`}>
        <Providers>
          <ScrollToTop />
          <EventGate>
            <ConditionalChrome>
              {children}
            </ConditionalChrome>
          </EventGate>
        </Providers>
      </body>
    </html>
  );
}
