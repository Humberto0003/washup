import { apiRequest } from "@/services/apiClient";
import {
  Customer,
  NewQueueItemData,
  QueueItem,
  QueueStatus,
  UpdateQueueItemData,
  WashServiceType,
} from "@/types/washup";
import { formatCpf, formatPhone, getPlateRaw } from "@/lib/formatters";

type ApiWashServiceType =
  | WashServiceType
  | "Higienizacao interna"
  | "Higienização interna";

type ApiQueueItem = Omit<QueueItem, "serviceType"> & {
  serviceType: ApiWashServiceType;
};

type VehicleByPlateResponse = {
  vehicle: {
    id: string;
    plate: string;
    normalizedPlate: string;
  };
  customer: Customer;
};

type AdvanceQueueItemResponse = {
  item?: ApiQueueItem;
  finished: boolean;
};

const INTERNAL_HYGIENE_SERVICE =
  "Higienização interna" as WashServiceType;

const toInternalServiceType = (
  serviceType: ApiWashServiceType
): WashServiceType => {
  if (
    serviceType === "Higienizacao interna" ||
    serviceType === "Higienização interna"
  ) {
    return INTERNAL_HYGIENE_SERVICE;
  }

  return serviceType;
};

const toApiServiceType = (serviceType: WashServiceType): ApiWashServiceType => {
  if (
    serviceType === INTERNAL_HYGIENE_SERVICE ||
    serviceType === ("Higienização interna" as WashServiceType)
  ) {
    return "Higienizacao interna";
  }

  return serviceType;
};

const normalizeQueueItem = (item: ApiQueueItem): QueueItem => ({
  ...item,
  plate: getPlateRaw(item.plate),
  phone: formatPhone(item.phone),
  cpf: item.cpf ? formatCpf(item.cpf) : undefined,
  serviceType: toInternalServiceType(item.serviceType),
});

const normalizeCustomer = (customer: Customer): Customer => ({
  ...customer,
  plate: getPlateRaw(customer.plate),
  phone: formatPhone(customer.phone),
  cpf: customer.cpf ? formatCpf(customer.cpf) : undefined,
});

const toServiceOrderPayload = (data: NewQueueItemData) => ({
  customerName: data.customerName,
  phone: formatPhone(data.phone),
  cpf: data.cpf ? formatCpf(data.cpf) : undefined,
  plate: getPlateRaw(data.plate),
  serviceType: toApiServiceType(data.serviceType),
});

export async function getQueue() {
  const queue = await apiRequest<ApiQueueItem[]>("/service-orders");
  return queue.map(normalizeQueueItem);
}

export async function createQueueItem(data: NewQueueItemData) {
  const item = await apiRequest<ApiQueueItem>("/service-orders", {
    method: "POST",
    body: JSON.stringify(toServiceOrderPayload(data)),
  });

  return normalizeQueueItem(item);
}

export async function advanceQueueItem(id: string) {
  const data = await apiRequest<AdvanceQueueItemResponse>(
    `/service-orders/${id}/advance`,
    {
      method: "PATCH",
    }
  );

  return {
    ...data,
    item: data.item ? normalizeQueueItem(data.item) : undefined,
  };
}

export async function updateQueueItem(data: UpdateQueueItemData) {
  const item = await apiRequest<ApiQueueItem>(`/service-orders/${data.id}`, {
    method: "PATCH",
    body: JSON.stringify(toServiceOrderPayload(data)),
  });

  return normalizeQueueItem(item);
}

export async function cancelQueueItem(id: string) {
  const data = await apiRequest<string | { id: string }>(
    `/service-orders/${id}`,
    {
      method: "DELETE",
    }
  );

  return typeof data === "string" ? data : data.id;
}

export async function changeQueuePriority(id: string, direction: "UP" | "DOWN") {
  const item = await apiRequest<ApiQueueItem>(`/service-orders/${id}/priority`, {
    method: "PATCH",
    body: JSON.stringify({ direction }),
  });

  return normalizeQueueItem(item);
}

export async function reorderQueueItems(items: QueueItem[]) {
  const queue = await apiRequest<ApiQueueItem[]>("/service-orders/reorder", {
    method: "PATCH",
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        status: item.status,
        position: item.status === "DONE" ? 0 : item.position,
      })),
    }),
  });

  return queue.map(normalizeQueueItem);
}

export async function moveQueueItemStatus(id: string, status: QueueStatus) {
  const item = await apiRequest<ApiQueueItem>(`/service-orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return normalizeQueueItem(item);
}

export async function getCustomers() {
  const customers = await apiRequest<Customer[]>("/customers");
  return customers.map(normalizeCustomer);
}

export async function getVehicleByPlate(plate: string) {
  const data = await apiRequest<VehicleByPlateResponse>(
    `/vehicles/by-plate/${getPlateRaw(plate)}`
  );

  return {
    vehicle: {
      ...data.vehicle,
      plate: getPlateRaw(data.vehicle.plate),
      normalizedPlate: getPlateRaw(data.vehicle.normalizedPlate),
    },
    customer: normalizeCustomer(data.customer),
  };
}

export async function getTrackingByPlate(plate: string) {
  const item = await apiRequest<ApiQueueItem>(`/tracking/${getPlateRaw(plate)}`);
  return normalizeQueueItem(item);
}

export async function redeemBenefit(customerId: string) {
  const customer = await apiRequest<Customer>(
    `/customers/${customerId}/redeem-benefit`,
    {
      method: "POST",
    }
  );

  return normalizeCustomer(customer);
}
