import type { ReactNode } from 'react';
import { formatDate } from '../../../utils/date.ts';
import { formatExperienceMonths } from '../helpers/format-experience.ts';
import type { EmployeeDetails as EmployeeDetailsType } from '../types/employee.ts';

export type EmployeeDetailsSection =
  | 'personal'
  | 'job'
  | 'experience'
  | 'education'
  | 'relatives';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 break-words font-medium">{value || '—'}</p>
    </div>
  );
}

function DetailsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-white p-4 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmployeeDetails({
  employee,
  sectionActions,
  sectionEditors,
}: {
  employee: EmployeeDetailsType;
  sectionActions?: Partial<Record<EmployeeDetailsSection, ReactNode>>;
  sectionEditors?: Partial<Record<EmployeeDetailsSection, ReactNode>>;
}) {
  return (
    <div className="space-y-6">
      <DetailsSection title="Личные данные" action={sectionActions?.personal}>
        {sectionEditors?.personal ?? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Row
              label="ФИО"
              value={`${employee.lastName} ${employee.firstName} ${employee.middleName ?? ''}`}
            />
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
            <Row label="Пол" value={employee.gender.name} />
            <Row label="Гражданство" value={employee.citizenship.name} />
            <Row label="Национальность" value={employee.nationality.name} />
            <Row label="Семейное положение" value={employee.maritalStatus.name} />
          </div>
        )}
      </DetailsSection>

      <DetailsSection title="Текущая работа" action={sectionActions?.job}>
        {sectionEditors?.job ?? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Row label="Подразделение" value={employee.department?.name} />
            <Row label="Должность" value={employee.position?.name} />
            <Row label="Тип занятости" value={employee.employmentType?.name} />
            <Row label="Дата приёма" value={formatDate(employee.hireDate)} />
            <Row label="Общий стаж" value={formatExperienceMonths(employee.experience.totalMonths)} />
            <Row
              label="Стаж по специальности"
              value={formatExperienceMonths(employee.experience.specialtyMonths)}
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
        )}
      </DetailsSection>

      <DetailsSection title="Опыт работы" action={sectionActions?.experience}>
        {sectionEditors?.experience ??
          (employee.workExperience.length ? (
            <ul className="space-y-3">
              {employee.workExperience.map((item) => (
                <li key={item.id ?? item.companyName} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">
                    {item.positionName} · {item.companyName}
                  </p>
                  {item.cityName || item.countryName ? (
                    <p className="text-sm text-ink-500">
                      {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                  <p className="text-sm text-ink-500">
                    {formatDate(item.startDate)} —{' '}
                    {item.isCurrent ? 'н.в.' : formatDate(item.endDate)}
                  </p>
                  {item.responsibilities ? (
                    <p className="mt-2 text-sm text-ink-700">{item.responsibilities}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">Пока нет записей</p>
          ))}
      </DetailsSection>

      <DetailsSection title="Образование" action={sectionActions?.education}>
        {sectionEditors?.education ??
          (employee.education.length ? (
            <ul className="space-y-3">
              {employee.education.map((item) => (
                <li key={item.id ?? item.institutionName} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">{item.institutionName}</p>
                  {item.cityName || item.countryName ? (
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
          ))}
      </DetailsSection>

      <DetailsSection title="Родственники" action={sectionActions?.relatives}>
        {sectionEditors?.relatives ??
          (employee.relatives?.length ? (
            <ul className="space-y-3">
              {employee.relatives.map((item) => (
                <li key={item.id ?? item.fullName} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">{item.fullName}</p>
                  <p className="text-sm text-ink-500">{item.relationshipType}</p>
                  {item.occupation ? (
                    <p className="mt-1 text-sm text-ink-500">{item.occupation}</p>
                  ) : null}
                  {item.birthDate ? (
                    <p className="mt-1 text-sm text-ink-500">
                      Дата рождения: {formatDate(item.birthDate)}
                    </p>
                  ) : null}
                  {item.phone ? (
                    <p className="mt-1 text-sm text-ink-500">{item.phone}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">Пока нет записей</p>
          ))}
      </DetailsSection>
    </div>
  );
}
