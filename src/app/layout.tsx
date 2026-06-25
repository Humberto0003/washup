import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "WashUp",
  description: "Sistema de gestão de fila para lava jato",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased"> 
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
