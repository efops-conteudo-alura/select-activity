"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Instrutor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function InstrutoresPage() {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/instrutores")
      .then((r) => r.json())
      .then(setInstrutores)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/instrutores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao cadastrar instrutor.");
      return;
    }

    setInstrutores((prev) => [
      { id: data.id, name: data.name, email: data.email, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setName("");
    setEmail("");
    setSuccess(`${data.name} cadastrado. Compartilhe o link do app e peça que ele entre com o email.`);
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-2xl mx-auto w-full gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/upload"
          className="text-alura-blue-light/50 hover:text-alura-blue-light text-sm transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
          Instrutores
        </h1>
      </div>

      {/* Formulário de cadastro */}
      <div className="bg-alura-blue-dark rounded-2xl border border-alura-blue-light/20 p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-alura-blue-light text-sm uppercase tracking-wide">
          Adicionar instrutor
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
          />
          <input
            type="email"
            placeholder="Email do instrutor"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan"
          />
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-alura-cyan text-sm bg-alura-cyan/10 px-3 py-2 rounded-lg">{success}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold py-2 rounded-xl transition-colors text-sm"
          >
            {loading ? "Cadastrando..." : "Cadastrar instrutor"}
          </button>
        </form>
        <p className="text-alura-blue-light/40 text-xs">
          O instrutor entra no app apenas com o email — sem precisar criar senha.
        </p>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-alura-blue-light text-sm uppercase tracking-wide">
          {instrutores.length} {instrutores.length === 1 ? "instrutor" : "instrutores"} cadastrados
        </h2>
        {instrutores.length === 0 ? (
          <p className="text-alura-blue-light/40 text-sm">Nenhum instrutor cadastrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {instrutores.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between bg-alura-blue-dark rounded-xl border border-alura-blue-light/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-alura-blue-light">{i.name}</p>
                  <p className="text-xs text-alura-blue-light/50">{i.email}</p>
                </div>
                <p className="text-xs text-alura-blue-light/30">
                  {new Date(i.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
