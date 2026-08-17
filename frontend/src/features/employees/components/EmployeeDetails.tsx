import { formatDate } from '../../../utils/date.ts';
import type { EmployeeDetails } from '../types/employee.ts';

function formatMonths(months?: number) {
  if (!months) {
    return '—';
  }

  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) {
    return `${years} г. ${rest} мес.`;
  }
  if (years) {
    return `${years} г.`;
  }
  return `${rest} мес.`;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 break-words font-medium">{value || '—'}</p>
    </div>
  );
}

export function EmployeeDetails({ employee }: { employee: EmployeeDetails }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">Личные данные</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Row label="ФИО" value={`${employee.lastName} ${employee.firstName} ${employee.middleName ?? ''}`} />
          <Row label="Табельный номер" value={employee.employeeNumber} />
          <Row label="Дата рождения" value={formatDate(employee.birthDate)} />
          <Row label="ПИНФЛ" value={employee.pinfl} />
          <Row
            label="Паспорт"
            value={`${employee.passport.series} ${employee.passport.number}`}
          />
          <Row
            label="Срок действия паспорта"
            value={formatDate(employee.passport.expireDate)}
          />
          <Row label="Кем выдан" value={employee.passport.issuedBy} />
          <Row label="Телефон" value={employee.contact.phone} />
          <Row label="Email" value={employee.contact.email} />
          <Row label="Страна" value={employee.contact.country?.name} />
          <Row label="Город" value={employee.contact.city?.name} />
          <Row label="Адрес" value={employee.contact.address} />
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">Работа</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Row label="Подразделение" value={employee.department?.name} />
          <Row label="Должность" value={employee.position?.name} />
          <Row label="Тип занятости" value={employee.employmentType?.name} />
          <Row label="Дата приёма" value={formatDate(employee.hireDate)} />
          <Row label="Общий стаж" value={formatMonths(employee.experience.totalMonths)} />
          <Row
            label="Стаж по специальности"
            value={formatMonths(employee.experience.specialtyMonths)}
          />
          <Row label="Военная служба" value={employee.militaryService ? 'Да' : 'Нет'} />
          <Row
            label="Водительские права"
            value={
              employee.driverLicense.hasLicense
                ? employee.driverLicense.categoryName ?? 'Да'
                : 'Нет'
            }
          />
          <div className="sm:col-span-2 md:col-span-3">
            <Row label="Дополнительно" value={employee.additionalInfo} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">Образование</h2>
        {employee.education.length ? (
          <ul className="space-y-3">
            {employee.education.map((item) => (
              <li key={item.id ?? item.institutionName} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">{item.institutionName}</p>
                {(item.cityName || item.countryName) ? (
                  <p className="text-sm text-ink-500">
                    {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                  </p>
                ) : null}
                <p className="text-sm text-ink-500">
                  {[item.educationLevelName, item.specialty, item.graduationYear]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">Пока нет записей</p>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">Опыт работы</h2>
        {employee.workExperience.length ? (
          <ul className="space-y-3">
            {employee.workExperience.map((item) => (
              <li key={item.id ?? item.companyName} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">
                  {item.positionName} · {item.companyName}
                </p>
                {(item.cityName || item.countryName) ? (
                  <p className="text-sm text-ink-500">
                    {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                  </p>
                ) : null}
                <p className="text-sm text-ink-500">
                  {formatDate(item.startDate)} — {item.isCurrent ? 'н.в.' : formatDate(item.endDate)}
                </p>
                {item.responsibilities ? (
                  <p className="mt-2 text-sm text-ink-700">{item.responsibilities}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">Пока нет записей</p>
        )}
      </section>
    </div>
  );
}
