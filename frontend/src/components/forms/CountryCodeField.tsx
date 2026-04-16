import { getCountryDataList } from "countries-list";
import { useId, useMemo, useState, type KeyboardEvent } from "react";

import "./CountryCodeField.css";

type CountryCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

type CountryOption = {
  code: string;
  name: string;
  label: string;
  search: string;
};

const COUNTRY_OPTIONS: CountryOption[] = getCountryDataList()
  .filter((country) => !country.userAssigned)
  .map((country) => ({
    code: country.iso2,
    name: country.name,
    label: `${country.name} (${country.iso2})`,
    search: `${country.name} ${country.iso2}`.toLowerCase(),
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

function getCountryOption(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) {
    return null;
  }

  return COUNTRY_OPTIONS.find((option) => option.code.toLowerCase() === normalizedValue) ?? null;
}

function findExactCountryOption(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  return COUNTRY_OPTIONS.find((option) => (
    option.code.toLowerCase() === normalizedQuery ||
    option.name.toLowerCase() === normalizedQuery ||
    option.label.toLowerCase() === normalizedQuery
  )) ?? null;
}

function sortCountryOptions(query: string, selectedCode: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedOption = getCountryOption(selectedCode);

  if (!normalizedQuery) {
    const baseOptions = selectedOption
      ? [selectedOption, ...COUNTRY_OPTIONS.filter((option) => option.code !== selectedOption.code)]
      : COUNTRY_OPTIONS;

    return baseOptions.slice(0, 8);
  }

  return COUNTRY_OPTIONS
    .filter((option) => option.search.includes(normalizedQuery))
    .sort((left, right) => {
      const leftCode = left.code.toLowerCase();
      const rightCode = right.code.toLowerCase();
      const leftName = left.name.toLowerCase();
      const rightName = right.name.toLowerCase();

      const leftRank = leftCode === normalizedQuery
        ? 0
        : leftCode.startsWith(normalizedQuery)
          ? 1
          : leftName.startsWith(normalizedQuery)
            ? 2
            : 3;
      const rightRank = rightCode === normalizedQuery
        ? 0
        : rightCode.startsWith(normalizedQuery)
          ? 1
          : rightName.startsWith(normalizedQuery)
            ? 2
            : 3;

      return leftRank - rightRank || left.name.localeCompare(right.name);
    })
    .slice(0, 8);
}

export function CountryCodeField({ value, onChange, disabled = false, placeholder = "France or FR" }: CountryCodeFieldProps) {
  const listId = useId();
  const selectedOption = getCountryOption(value);
  const [query, setQuery] = useState(selectedOption?.label ?? value.trim());
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => sortCountryOptions(query, value), [query, value]);
  const displayValue = isOpen ? query : selectedOption?.label ?? value.trim();

  function commitOption(option: CountryOption | null) {
    onChange(option?.code ?? "");
    setQuery(option?.label ?? "");
    setIsOpen(false);
  }

  function handleBlur() {
    const exactOption = findExactCountryOption(query);

    window.setTimeout(() => {
      if (exactOption) {
        commitOption(exactOption);
        return;
      }

      if (!query.trim()) {
        commitOption(null);
        return;
      }

      setQuery(selectedOption?.label ?? "");
      setIsOpen(false);
    }, 120);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((currentIndex) => (currentIndex + 1) % Math.max(filteredOptions.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((currentIndex) => (
        currentIndex <= 0 ? Math.max(filteredOptions.length - 1, 0) : currentIndex - 1
      ));
      return;
    }

    if (event.key === "Enter") {
      const exactOption = findExactCountryOption(query);
      const nextOption = exactOption ?? filteredOptions[activeIndex] ?? filteredOptions[0] ?? null;
      if (nextOption) {
        event.preventDefault();
        commitOption(nextOption);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setQuery(selectedOption?.label ?? "");
      setIsOpen(false);
    }
  }

  return (
    <div className="country-code-field">
      <input
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery(selectedOption?.label ?? value.trim());
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && filteredOptions[activeIndex] ? `${listId}-${filteredOptions[activeIndex].code}` : undefined}
        disabled={disabled}
        value={displayValue}
      />

      <p className="country-code-field__helper">
        {selectedOption ? `Stored as ISO code: ${selectedOption.code}` : "Search by country name or ISO code"}
      </p>

      {isOpen && (
        <div className="country-code-field__menu" id={listId} role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={option.code}
                id={`${listId}-${option.code}`}
                type="button"
                role="option"
                aria-selected={value === option.code}
                className={`country-code-field__option ${index === activeIndex ? "is-active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitOption(option)}
              >
                <span className="country-code-field__option-name">{option.name}</span>
                <span className="country-code-field__option-code">{option.code}</span>
              </button>
            ))
          ) : (
            <p className="country-code-field__empty">No matching country</p>
          )}
        </div>
      )}
    </div>
  );
}
