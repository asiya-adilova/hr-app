import { LoginForm } from '../components/LoginForm.tsx';
import { PublicNav } from '../../../components/layout/PublicNav.tsx';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4 md:p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 md:p-8">
        <PublicNav />
        <h1 className="text-2xl font-bold">Вход</h1>
        <p className="mt-2 mb-6 text-sm text-ink-500">
          Сотрудник попадёт в личный кабинет.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
