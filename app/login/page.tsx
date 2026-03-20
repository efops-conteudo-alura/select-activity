"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === "NeedPassword") {
        setError("Sua conta ainda não tem senha. Defina uma em /criar-senha.");
      } else if (result.error === "NoAccess") {
        setError("Você não tem acesso a este sistema. Contacte um coordenador.");
      } else {
        setError("Email ou senha inválidos.");
      }
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-alura-blue-deep px-6">
      <div className="w-full max-w-md bg-alura-blue-dark rounded-2xl border border-alura-blue-light/20 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
            Seletor de Atividades
          </h1>
          <p className="text-alura-blue-light/60 text-sm">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-alura-blue-light/70">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-alura-blue-light/70">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
              {error}{" "}
              {error.includes("/criar-senha") && (
                <Link href="/criar-senha" className="underline font-medium">
                  Definir senha
                </Link>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
