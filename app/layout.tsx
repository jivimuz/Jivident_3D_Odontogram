import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatChat from "./Component/floatChat.Component";
import Footer from "./Component/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JiviDent 3D",
  description: "Free 3D Odontogram Apps by Jivi Muzaqi Guntur",
   keywords: ["3d mapping", "webgl", "open source 3d", "3d map nextjs", 'free 3d odontogram', 'mapping gigi', '3d odontogram'],
  openGraph: {
    title: "Free 3D Odontogram",
    description: "Try interactive 3D odontology mapping directly in your browser.",
    images: ["/assets/logo.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-white min-h-full w-full  pb-10">

        {children}
        </div>
        <FloatChat />
        <Footer/>
      </body>
    </html>
  );
}
