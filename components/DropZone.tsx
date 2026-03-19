"use client";

import { useRef, useState } from "react";

type Props = {
  onFile: (content: string, fileName: string) => void;
  onError: (message: string) => void;
};

export function DropZone({ onFile, onError }: Props) {
  const [highlighted, setHighlighted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    if (!file.name.endsWith(".json")) {
      onError("Selecione um arquivo .json válido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        JSON.parse(content);
        onFile(content, file.name);
      } catch {
        onError("O arquivo JSON está mal formatado.");
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setHighlighted(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHighlighted(true); }}
      onDragLeave={() => setHighlighted(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        highlighted
          ? "border-alura-cyan bg-alura-blue/20"
          : "border-alura-blue-light/40 hover:border-alura-cyan hover:bg-alura-blue/10"
      }`}
    >
      <span className="text-3xl">📂</span>
      <p className="text-alura-blue-light text-sm text-center px-4">
        Arraste o arquivo <span className="text-alura-cyan font-semibold">.json</span> aqui
        <br />
        ou clique para procurar
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
