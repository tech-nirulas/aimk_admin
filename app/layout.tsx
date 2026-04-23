import AdminLayout from "@/components/layout/AdminLayout";
import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Lato, Playfair_Display } from "next/font/google";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angels in my Kitchen Admin",
  description: "Handcrafted pastries and cakes made with love since 1987. Experience the art of baking.",
  openGraph: {
    title: "Angels in my Kitchen Admin",
    description: "Handcrafted pastries and cakes made with love since 1987.",
    type: "website",
  },
};

const playfair = Playfair_Display({ subsets: ["latin"] });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${playfair.className} ${lato.className} ${cormorant.className} ${dmMono.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}