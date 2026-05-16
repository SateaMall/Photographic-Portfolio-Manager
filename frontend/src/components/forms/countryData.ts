import { getCountryDataList } from "countries-list";

export type CountryOption = {
  code: string;
  name: string;
  label: string;
  search: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = getCountryDataList()
  .filter((country) => !country.userAssigned)
  .map((country) => ({
    code: country.iso2,
    name: country.name,
    label: `${country.name} (${country.iso2})`,
    search: `${country.name} ${country.iso2}`.toLowerCase(),
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

const COUNTRY_OPTIONS_BY_CODE = new Map(
  COUNTRY_OPTIONS.map((option) => [option.code.toLowerCase(), option]),
);

export function getCountryOption(value: string | null | undefined) {
  const normalizedValue = value?.trim().toLowerCase() ?? "";
  if (!normalizedValue) {
    return null;
  }

  return COUNTRY_OPTIONS_BY_CODE.get(normalizedValue) ?? null;
}

export function getCountryDisplayName(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? "";
  if (!trimmedValue) {
    return "";
  }

  return getCountryOption(trimmedValue)?.name ?? trimmedValue;
}
