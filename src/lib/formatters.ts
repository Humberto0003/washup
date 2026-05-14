export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
    7,
    11
  )}`;
}

export function getPhoneDigits(value: string) {
  return onlyNumbers(value);
}

export function formatPlateInput(value: string) {
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);

  if (clean.length <= 3) {
    return clean;
  }

  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

export function getPlateRaw(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

export function isValidPlate(value: string) {
  const raw = getPlateRaw(value);
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(raw);
}

export function formatCpf(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }

  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }

  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9)}`;
}

export function getCpfDigits(value: string) {
  return value.replace(/\D/g, "");
}
