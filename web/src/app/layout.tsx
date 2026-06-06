import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { CommandPalette } from "@/components/command-palette";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Modul comp — оптические трансиверы и сетевое оборудование",
  description:
    "B2B-магазин SFP/QSFP-модулей, трансиверов, DAC/AOC, патч-кордов и CWDM/DWDM с техническим подбором, кросс-фильтром совместимости и ИИ-со-пилотом.",
};

// Anti-FOUC: apply saved theme class before first paint (W11).
const themeInit = `(function(){try{if(localStorage.getItem('modul-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <StoreProvider>
          {children}
          <CommandPalette />
        </StoreProvider>
      </body>
    </html>
  );
}
