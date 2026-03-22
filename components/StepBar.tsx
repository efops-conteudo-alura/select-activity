type Props = {
  steps: string[];
  current: number; // 1-based
};

export function StepBar({ steps, current }: Props) {
  return (
    <div className="flex items-start justify-center">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;

        return (
          <div key={step} className="flex items-start">
            {/* Círculo + label */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-alura-cyan/30 text-alura-cyan"
                    : active
                    ? "bg-alura-cyan text-alura-blue-deep"
                    : "bg-alura-blue-light/10 text-alura-blue-light/30"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span
                className={`text-xs whitespace-nowrap transition-colors ${
                  active
                    ? "text-alura-cyan font-semibold"
                    : done
                    ? "text-alura-cyan/50"
                    : "text-alura-blue-light/30"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Linha conectora (só entre passos) */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-px mt-3.5 mx-2 transition-colors ${
                  done ? "bg-alura-cyan/30" : "bg-alura-blue-light/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
