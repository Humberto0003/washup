import {
  advanceQueueItem,
  cancelQueueItem,
  changeQueuePriority,
  createQueueItem,
  getCustomers,
  getQueue,
  getTrackingByPlate,
  getVehicleByPlate,
  redeemBenefit,
  reorderQueueItems,
  updateQueueItem,
} from "@/services/washup";
import { getApiErrorMessage } from "@/services/apiClient";
import { NewQueueItemData, QueueItem, UpdateQueueItemData } from "@/types/washup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const QUEUE_KEY = "washup-queue";
const CUSTOMERS_KEY = "washup-customers";
const VEHICLE_BY_PLATE_KEY = "washup-vehicle-by-plate";
const TRACKING_KEY = "washup-tracking";

const invalidateQueue = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });

const invalidateTracking = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: [TRACKING_KEY] });

const FindQueue = () => {
  return useQuery({
    queryKey: [QUEUE_KEY],
    queryFn: getQueue,
  });
};

const CreateQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewQueueItemData) => createQueueItem(data),
    onSuccess: () => {
      toast.success("Atendimento adicionado à fila!");
      invalidateQueue(queryClient);
      invalidateTracking(queryClient);
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

const AdvanceQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advanceQueueItem(id),
    onSuccess: (data) => {
      if (data.finished) {
        toast.success("Atendimento finalizado. Cliente recebeu 1 ponto de fidelidade.");
        queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      } else {
        toast.success("Status do veículo atualizado!");
      }

      invalidateQueue(queryClient);
      invalidateTracking(queryClient);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

const UpdateQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQueueItemData) => updateQueueItem(data),
    onSuccess: () => {
      toast.success("Atendimento atualizado com sucesso!");
      invalidateQueue(queryClient);
      invalidateTracking(queryClient);
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

const CancelQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelQueueItem(id),
    onSuccess: () => {
      toast.success("Atendimento cancelado com sucesso!");
      invalidateQueue(queryClient);
      invalidateTracking(queryClient);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

const ChangeQueuePriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; direction: "UP" | "DOWN" }) =>
      changeQueuePriority(data.id, data.direction),
    onSuccess: () => {
      toast.success("Prioridade da fila atualizada!");
      invalidateQueue(queryClient);
      invalidateTracking(queryClient);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

const ReorderQueueItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: QueueItem[]) => reorderQueueItems(items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: [QUEUE_KEY] });

      const previousQueue = queryClient.getQueryData<QueueItem[]>([QUEUE_KEY]);
      queryClient.setQueryData([QUEUE_KEY], items);

      return { previousQueue };
    },
    onError: (error, _items, context) => {
      if (context?.previousQueue) {
        queryClient.setQueryData([QUEUE_KEY], context.previousQueue);
      }

      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (items) => {
      queryClient.setQueryData([QUEUE_KEY], items);
      toast.success("Fila reorganizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      invalidateTracking(queryClient);
    },
  });
};

const FindCustomers = () => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY],
    queryFn: getCustomers,
  });
};

const FindVehicleByPlate = (plate: string, enabled = false) => {
  return useQuery({
    queryKey: [VEHICLE_BY_PLATE_KEY, plate],
    queryFn: () => getVehicleByPlate(plate),
    enabled: enabled && plate.length === 7,
    retry: false,
  });
};

const FindTrackingByPlate = (plate: string, enabled = false) => {
  return useQuery({
    queryKey: [TRACKING_KEY, plate],
    queryFn: () => getTrackingByPlate(plate),
    enabled: enabled && plate.length === 7,
    retry: false,
  });
};

const RedeemBenefit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => redeemBenefit(customerId),
    onSuccess: () => {
      toast.success("Benefício resgatado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const washUpQueryKeys = {
  queue: [QUEUE_KEY] as const,
  customers: [CUSTOMERS_KEY] as const,
  vehicleByPlate: (plate: string) => [VEHICLE_BY_PLATE_KEY, plate] as const,
  tracking: (plate: string) => [TRACKING_KEY, plate] as const,
};

export const useWashUp = {
  FindQueue,
  CreateQueueItem,
  AdvanceQueueItem,
  UpdateQueueItem,
  CancelQueueItem,
  ChangeQueuePriority,
  ReorderQueueItems,
  FindCustomers,
  FindVehicleByPlate,
  FindTrackingByPlate,
  RedeemBenefit,
};
