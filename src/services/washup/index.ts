import { mockCustomers, mockQueue } from "@/mocks/washup";
import {
  Customer,
  NewQueueItemData,
  QueueItem,
  QueueStatus,
  UpdateQueueItemData,
} from "@/types/washup";
import { getCpfDigits, getPlateRaw } from "@/lib/formatters";

const QUEUE_STORAGE_KEY = "washup:queue";
const CUSTOMERS_STORAGE_KEY = "washup:customers";

const wait = async () => new Promise((resolve) => setTimeout(resolve, 250));

const readStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  return JSON.parse(value) as T;
};

const writeStorage = <T>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const normalizeQueue = (queue: QueueItem[]) => {
  const nextQueue = [...queue];

  (["WAITING", "WASHING", "DONE"] as QueueStatus[]).forEach((status) => {
    let position = 1;

    nextQueue
      .filter((item) => item.status === status)
      .forEach((item) => {
        item.position = status === "DONE" ? 0 : position;
        item.etaMinutes =
          status === "DONE" ? 0 : status === "WASHING" ? 15 : position * 20 + 5;
        position += 1;
      });
  });

  return nextQueue;
};

const upsertCustomerFromFinishedQueueItem = (queueItem: QueueItem) => {
  const customers = readStorage<Customer[]>(CUSTOMERS_STORAGE_KEY, mockCustomers);
  const cpfDigits = getCpfDigits(queueItem.cpf ?? "");
  const plateRaw = getPlateRaw(queueItem.plate);

  const customerByCpfIndex = cpfDigits
    ? customers.findIndex(
        (customer) => getCpfDigits(customer.cpf ?? "") === cpfDigits
      )
    : -1;
  const existingCustomerIndex =
    customerByCpfIndex >= 0
      ? customerByCpfIndex
      : customers.findIndex(
          (customer) => getPlateRaw(customer.plate) === plateRaw
        );

  if (existingCustomerIndex >= 0) {
    const nextCustomers = [...customers];
    const existingCustomer = nextCustomers[existingCustomerIndex];

    nextCustomers[existingCustomerIndex] = {
      ...existingCustomer,
      name: queueItem.customerName,
      phone: queueItem.phone,
      cpf: queueItem.cpf || existingCustomer.cpf,
      plate: plateRaw,
      totalVisits: existingCustomer.totalVisits + 1,
      loyaltyPoints: existingCustomer.loyaltyPoints + 1,
    };

    writeStorage(CUSTOMERS_STORAGE_KEY, nextCustomers);
    return nextCustomers[existingCustomerIndex];
  }

  const newCustomer: Customer = {
    id: crypto.randomUUID(),
    name: queueItem.customerName,
    phone: queueItem.phone,
    cpf: queueItem.cpf,
    plate: plateRaw,
    totalVisits: 1,
    loyaltyPoints: 1,
  };

  writeStorage(CUSTOMERS_STORAGE_KEY, [...customers, newCustomer]);
  return newCustomer;
};

export async function getQueue() {
  await wait();
  return normalizeQueue(readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue));
}

export async function createQueueItem(data: NewQueueItemData) {
  await wait();

  const queue = readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue);
  const waitingCount = queue.filter((item) => item.status === "WAITING").length;

  const newItem: QueueItem = {
    id: crypto.randomUUID(),
    ...data,
    plate: getPlateRaw(data.plate),
    status: "WAITING",
    position: waitingCount + 1,
    etaMinutes: (waitingCount + 1) * 20 + 5,
    createdAt: new Date().toISOString(),
  };

  const nextQueue = normalizeQueue([...queue, newItem]);
  writeStorage(QUEUE_STORAGE_KEY, nextQueue);

  return newItem;
}

export async function advanceQueueItem(id: string) {
  await wait();

  const queue = readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue);
  let finishedItem: QueueItem | null = null;

  const nextQueue = queue.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const nextStatus: QueueStatus =
      item.status === "WAITING" ? "WASHING" : "DONE";

    const updatedItem = {
      ...item,
      status: nextStatus,
    };

    if (item.status !== "DONE" && nextStatus === "DONE") {
      finishedItem = updatedItem;
    }

    return updatedItem;
  });

  const normalizedQueue = normalizeQueue(nextQueue);
  writeStorage(QUEUE_STORAGE_KEY, normalizedQueue);

  if (finishedItem) {
    upsertCustomerFromFinishedQueueItem(finishedItem);
  }

  return {
    item: normalizedQueue.find((item) => item.id === id),
    finished: Boolean(finishedItem),
  };
}

export async function updateQueueItem(data: UpdateQueueItemData) {
  await wait();

  const queue = readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue);
  const nextQueue = queue.map((item) =>
    item.id === data.id
      ? {
          ...item,
          customerName: data.customerName,
          phone: data.phone,
          cpf: data.cpf,
          plate: getPlateRaw(data.plate),
          serviceType: data.serviceType,
        }
      : item
  );

  const normalizedQueue = normalizeQueue(nextQueue);
  writeStorage(QUEUE_STORAGE_KEY, normalizedQueue);

  return normalizedQueue.find((item) => item.id === data.id);
}

export async function cancelQueueItem(id: string) {
  await wait();

  const queue = readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue);
  const nextQueue = normalizeQueue(queue.filter((item) => item.id !== id));
  writeStorage(QUEUE_STORAGE_KEY, nextQueue);

  return id;
}

export async function changeQueuePriority(id: string, direction: "UP" | "DOWN") {
  await wait();

  const queue = normalizeQueue(readStorage<QueueItem[]>(QUEUE_STORAGE_KEY, mockQueue));
  const waitingItems = queue
    .filter((item) => item.status === "WAITING")
    .sort((a, b) => a.position - b.position);
  const currentIndex = waitingItems.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    return queue.find((item) => item.id === id);
  }

  const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
  if (!waitingItems[targetIndex]) {
    return waitingItems[currentIndex];
  }

  const reorderedWaitingItems = [...waitingItems];
  const [currentItem] = reorderedWaitingItems.splice(currentIndex, 1);
  reorderedWaitingItems.splice(targetIndex, 0, currentItem);

  const nextQueue = queue.map((item) => {
    if (item.status !== "WAITING") {
      return item;
    }

    const reorderedItem = reorderedWaitingItems.shift();
    return reorderedItem ?? item;
  });

  const normalizedQueue = normalizeQueue(nextQueue);
  writeStorage(QUEUE_STORAGE_KEY, normalizedQueue);

  return normalizedQueue.find((item) => item.id === id);
}

export async function getCustomers() {
  await wait();
  return readStorage<Customer[]>(CUSTOMERS_STORAGE_KEY, mockCustomers);
}

export async function redeemBenefit(customerId: string) {
  await wait();

  const customers = readStorage<Customer[]>(CUSTOMERS_STORAGE_KEY, mockCustomers);
  const nextCustomers = customers.map((customer) =>
    customer.id === customerId
      ? { ...customer, loyaltyPoints: Math.max(customer.loyaltyPoints - 10, 0) }
      : customer
  );

  writeStorage(CUSTOMERS_STORAGE_KEY, nextCustomers);
  return nextCustomers.find((customer) => customer.id === customerId);
}
