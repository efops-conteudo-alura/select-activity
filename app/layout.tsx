import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

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
        <Providers>
          <div className="bg-yellow-400 text-yellow-900 text-sm text-center px-4 py-2 font-semibold">
            ⚠️ Este app será descontinuado em breve e não receberá novas atualizações.
            Para usar a versão mais recente do Seletor de Atividades, acesse o{" "}
            <a
              href="https://hub-producao-conteudo.vercel.app/home"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold hover:text-yellow-950"
            >
              Hub de Produção de Conteúdo
            </a>
            {" "}e conecte-se com a mesma conta (você não perderá nenhuma atividade salva).
          </div>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
