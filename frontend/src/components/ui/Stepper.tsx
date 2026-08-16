type Step = {
  title: string;
  hint: string;
};

type StepperProps = {
  steps: Step[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const active = index === current;
        const done = index < current;

        return (
          <li
            key={step.title}
            className={`rounded-2xl border px-4 py-3 ${
              active
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
  );
}
