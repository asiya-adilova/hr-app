type Step = {
  title: string;
  hint: string;
};

type StepperProps = {
  steps: Step[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  const active = steps[current];

  return (
    <>
      <div className="rounded-2xl border border-brand-500 bg-brand-50 px-4 py-3 md:hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Шаг {current + 1} из {steps.length}
        </p>
        <p className="mt-1 font-semibold text-ink-900">{active?.title}</p>
        <p className="text-xs text-ink-500">{active?.hint}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden gap-3 md:grid md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === current;
          const done = index < current;

          return (
            <li
              key={step.title}
              className={`rounded-2xl border px-4 py-3 ${
                isActive
                  ? 'border-brand-500 bg-brand-50'
                  : done
                    ? 'border-brand-100 bg-white'
                    : 'border-line bg-white'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Шаг {index + 1}
              </p>
              <p className="mt-1 font-semibold text-ink-900">{step.title}</p>
              <p className="mt-0.5 text-xs text-ink-500">{step.hint}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
