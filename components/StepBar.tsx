type Props = {
  steps: string[];
  current: number; // 1-based
};

export function StepBar({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
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

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-4 transition-colors ${
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
