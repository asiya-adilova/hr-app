import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { homePath, routes } from '../../../constants/routes.ts';
import { useDebouncedError } from '../../../hooks/useDebouncedError.ts';
import { ApiError } from '../../../services/api-client.ts';
import { isEmail, emailFormatError } from '../../../utils/validation.ts';
import { useAuth } from '../hooks/useAuth.ts';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailIdle = useDebouncedError(email, emailFormatError);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isEmail(email) || !password) {
      if (!isEmail(email)) {
        setEmailError(email.trim() ? 'Некорректный email' : 'Укажите email');
      }
      if (!password) {
        setError('Введите пароль');
      }
      return;
    }

    setSubmitting(true);
    setError(null);
    setEmailError('');

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
        error={emailError || emailIdle.error}
        onChange={(event) => {
          setEmail(event.target.value);
          setEmailError('');
        }}
        onBlur={emailIdle.showNow}
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
