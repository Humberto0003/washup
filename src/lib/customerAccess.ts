import { Customer, QueueItem } from "@/types/washup";
import { getPlateRaw } from "./formatters";

export const CUSTOMER_PLATE_STORAGE_KEY = "washup:customer-plate";

export function normalizePlate(value: string) {
  return getPlateRaw(value);
}

export function findQueueItemByPlate(items: QueueItem[], plate: string) {
  const normalizedPlate = normalizePlate(plate);

  return items.find((item) => normalizePlate(item.plate) === normalizedPlate);
}

export function findCustomerByPlate(customers: Customer[], plate: string) {
  const normalizedPlate = normalizePlate(plate);

  return customers.find(
    (customer) => normalizePlate(customer.plate) === normalizedPlate
  );
}
