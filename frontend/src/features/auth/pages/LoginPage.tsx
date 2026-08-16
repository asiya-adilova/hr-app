import { LoginForm } from '../components/LoginForm.tsx';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#ccfbf1,_#f8fafc_45%)] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-xl shadow-slate-200">
        <p className="text-sm font-semibold text-brand-700">HR Portal</p>
        <h1 className="mt-2 text-2xl font-bold">Вход в кабинет</h1>
        <p className="mt-2 mb-6 text-sm text-ink-500">
          Войдите, чтобы заполнить анкету или посмотреть свой профиль.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
