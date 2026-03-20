"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CriarSenhaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar senha.");
      return;
    }

    router.push("/login?msg=senha-criada");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-alura-blue-deep px-6">
      <div className="w-full max-w-md bg-alura-blue-dark rounded-2xl border border-alura-blue-light/20 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
            Definir senha
          </h1>
          <p className="text-alura-blue-light/60 text-sm">
            Crie uma senha para o seu primeiro acesso
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
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm text-alura-blue-light/70">
              Confirmar senha
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              required
              className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? "Salvando..." : "Definir senha"}
          </button>

          <p className="text-center text-sm text-alura-blue-light/50">
            <Link href="/login" className="underline hover:text-alura-blue-light">
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
