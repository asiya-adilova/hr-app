import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { routes } from '../../../constants/routes.ts';
import { useDebouncedError } from '../../../hooks/useDebouncedError.ts';
import { ApiError } from '../../../services/api-client.ts';
import {
  emailFormatError,
  isEmail,
  PASSWORD_HINT,
  PASSWORD_PATTERN,
} from '../../../utils/validation.ts';
import { useAuth } from '../hooks/useAuth.ts';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailIdle = useDebouncedError(email, emailFormatError);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !isEmail(email)) {
      if (!isEmail(email)) {
        setEmailError(email.trim() ? 'Некорректный email' : 'Укажите email');
      }
      if (!firstName.trim() || !lastName.trim()) {
        setError('Заполните имя и фамилию');
      }
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setSubmitting(true);
    setError(null);
    setEmailError('');

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        email,
        password,
      });
      navigate(routes.createEmployee);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Не удалось зарегистрироваться',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Имя"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Input
          label="Фамилия"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>
      <Input
        label="Отчество"
        value={middleName}
        onChange={(event) => setMiddleName(event.target.value)}
      />
      <Input
        label="Email"
        type="email"
        value={email}
        error={emailError || emailIdle.error}
        onChange={(event) => {
          setEmail(event.target.value);
          setEmailError('');
        }}
        onBlur={emailIdle.showNow}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <p className="text-xs text-ink-500">{PASSWORD_HINT}</p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
      </Button>
      <p className="text-center text-sm text-ink-500">
        Уже есть аккаунт?{' '}
        <Link to={routes.login} className="font-semibold text-brand-700">
          Войти
        </Link>
      </p>
    </form>
  );
}
