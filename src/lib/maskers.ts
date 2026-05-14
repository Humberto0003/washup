export function maskClientName(name: string) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase();

  return `${firstName} ${lastInitial}.`;
}

export function maskPhone(phone: string) {
  const numbers = phone.replace(/\D/g, "");

  if (numbers.length < 10) {
    return phone;
  }

  const ddd = numbers.slice(0, 2);
  const lastFour = numbers.slice(-4);

  return `(${ddd}) *****-${lastFour}`;
}

export function maskPlate(plate: string) {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (clean.length < 7) {
    return clean;
  }

  return `${clean.slice(0, 2)}*-${clean.slice(3, 5)}**`;
}
