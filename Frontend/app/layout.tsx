import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Internship Recommender",
  description: "AI-based internship recommender for PM Internship Scheme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        
        {/* --- NAYA DESIGNER HEADER (Glassmorphism Style) --- */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {/* Left Side: Logo and Title */}
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <h1 className="text-xl font-bold text-indigo-600">
                Internship Portal
              </h1>
            </div>
            {/* Right Side: Translator */}
            <div className="flex items-center gap-4">
              <div id="google_translate_element"></div>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}