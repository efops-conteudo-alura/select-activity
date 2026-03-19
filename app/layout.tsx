import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seletor de Atividades — Alura",
  description: "Selecione e revise atividades de cursos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${chakraPetch.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
