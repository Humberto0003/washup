export type QueueStatus = "WAITING" | "WASHING" | "DONE";

export type WashServiceType =
  | "Lavagem simples"
  | "Lavagem completa"
  | "Higienização interna"
  | "Polimento";

export type QueueItem = {
  id: string;
  customerName: string;
  phone: string;
  cpf?: string;
  plate: string;
  serviceType: WashServiceType;
  status: QueueStatus;
  position: number;
  etaMinutes: number;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  plate: string;
  totalVisits: number;
  loyaltyPoints: number;
};

export type DashboardSummary = {
  waiting: number;
  washing: number;
  done: number;
  recurringCustomers: number;
};

export type NewQueueItemData = {
  customerName: string;
  phone: string;
  cpf?: string;
  plate: string;
  serviceType: WashServiceType;
};

export type UpdateQueueItemData = NewQueueItemData & {
  id: string;
};
