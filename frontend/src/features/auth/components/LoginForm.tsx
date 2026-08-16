import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { homePath, routes } from '../../../constants/routes.ts';
import { ApiError } from '../../../services/api-client.ts';
import { isEmail } from '../../../utils/validation.ts';
import { useAuth } from '../hooks/useAuth.ts';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isEmail(email) || !password) {
      setError('Введите email и пароль');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const account = await login({ email, password });
      navigate(homePath(account.role, account.employeeId));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось войти');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
      />
      <Input
        label="Пароль"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Входим...' : 'Войти'}
      </Button>
      <p className="text-center text-sm text-ink-500">
        Нет аккаунта?{' '}
        <Link to={routes.register} className="font-semibold text-brand-700">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
