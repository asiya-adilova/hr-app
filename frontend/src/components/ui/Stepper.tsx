type Step = {
  title: string;
  hint: string;
};

type StepperProps = {
  steps: Step[];
  current: number;
  maxReached: number;
  canAdvance: boolean;
  onSelect: (index: number) => void;
};

function isClickable(
  index: number,
  current: number,
  maxReached: number,
  canAdvance: boolean,
) {
  if (index === current) {
    return false;
  }
  if (index < current) {
    return true;
  }
  return index <= maxReached && canAdvance;
}

export function Stepper({
  steps,
  current,
  maxReached,
  canAdvance,
  onSelect,
}: StepperProps) {
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
        <div className="mt-3 flex gap-2">
          {steps.map((step, index) => {
            const clickable = isClickable(index, current, maxReached, canAdvance);
            const isActive = index === current;

            return (
              <button
                key={step.title}
                type="button"
                disabled={!clickable && !isActive}
                onClick={() => {
                  if (clickable) {
                    onSelect(index);
                  }
                }}
                className={`h-8 flex-1 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : clickable
                      ? 'bg-white text-brand-700'
                      : 'cursor-not-allowed bg-white/70 text-ink-500 opacity-50'
                }`}
                aria-label={step.title}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <ol className="hidden w-full gap-3 md:grid md:grid-cols-5">
        {steps.map((step, index) => {
          const isActive = index === current;
          const done = index < current;
          const clickable = isClickable(index, current, maxReached, canAdvance);

          return (
            <li key={step.title} className="min-w-0">
              <button
                type="button"
                disabled={!clickable && !isActive}
                onClick={() => {
                  if (clickable) {
                    onSelect(index);
                  }
                }}
                className={`flex h-full w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-brand-500 bg-brand-50'
                    : clickable
                      ? 'cursor-pointer border-brand-100 bg-white hover:border-brand-500'
                      : done
                        ? 'border-brand-100 bg-white'
                        : 'cursor-not-allowed border-line bg-white opacity-60'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Шаг {index + 1}
                </p>
                <p className="mt-1 font-semibold text-ink-900">{step.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">{step.hint}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
