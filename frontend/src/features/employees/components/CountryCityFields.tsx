import { Select } from '../../../components/ui/Select.tsx';
import type { CityItem } from '../../references/types/references.ts';

type Option = {
  value: string | number;
  label: string;
};

type CountryCityFieldsProps = {
  countryId: string;
  cityId: string;
  countries: Option[];
  cities: CityItem[];
  countryError?: string;
  cityError?: string;
  onChange: (next: { countryId: string; cityId: string }) => void;
};

export function cityOptionsForCountry(cities: CityItem[], countryId: string) {
  return cities
    .filter((city) => String(city.countryId) === countryId)
    .map((city) => ({ value: city.id, label: city.name }));
}

export function formatLocation(
  cityName?: string,
  countryName?: string,
) {
  return [cityName, countryName].filter(Boolean).join(', ');
}

export function CountryCityFields({
  countryId,
  cityId,
  countries,
  cities,
  countryError,
  cityError,
  onChange,
}: CountryCityFieldsProps) {
  return (
    <>
      <Select
        label="Страна"
        value={countryId}
        options={countries}
        error={countryError}
        onChange={(event) => {
          const nextCountryId = event.target.value;
          const cityStillValid = cities.some(
            (city) =>
              String(city.id) === cityId && String(city.countryId) === nextCountryId,
          );
          onChange({
            countryId: nextCountryId,
            cityId: cityStillValid ? cityId : '',
          });
        }}
      />
      <Select
        label="Город"
        value={cityId}
        options={cityOptionsForCountry(cities, countryId)}
        error={cityError}
        disabled={!countryId}
        onChange={(event) => onChange({ countryId, cityId: event.target.value })}
      />
    </>
  );
}
