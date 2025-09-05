// app/layout.tsx
import React from "react";
import "./globals.css";

export const metadata = {
  title: "FocusFlow — Focus Timer",
  description: "A clean Pomodoro timer built with Next.js + Tailwind",
  icons: {
    icon: "/favicon.ico", 
  },
 
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100">{children}</body>
    </html>
  );
}
