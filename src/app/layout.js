import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "E-CELL MET — Track Application",
  description: "Where Ideas Meet Execution — E-Cell MET 2025–26 application portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <footer className="text-center text-sm text-gray-600 py-4 border-t">
          © {new Date().getFullYear()} E-CELL MET — Where Ideas Meet Execution
          <br /> Built by <a href="https://linked.com/in/hirodkar">Tanmay Hirodkar</a>
        </footer>
      </body>
    </html>
  );
}