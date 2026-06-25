import {
  advanceQueueItem,
  cancelQueueItem,
  changeQueuePriority,
  createQueueItem,
  getCustomers,
  getQueue,
  redeemBenefit,
  reorderQueueItems,
  updateQueueItem,
} from "@/services/washup";
import { NewQueueItemData, QueueItem, UpdateQueueItemData } from "@/types/washup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const QUEUE_KEY = "washup-queue";
const CUSTOMERS_KEY = "washup-customers";

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
      toast.success("Atendimento adicionado a fila!");
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
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
        toast.success("Status do veiculo atualizado!");
      }

      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
    },
  });
};

const UpdateQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQueueItemData) => updateQueueItem(data),
    onSuccess: () => {
      toast.success("Atendimento atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
    },
  });
};

const CancelQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelQueueItem(id),
    onSuccess: () => {
      toast.success("Atendimento cancelado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
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
    onError: (_error, _items, context) => {
      if (context?.previousQueue) {
        queryClient.setQueryData([QUEUE_KEY], context.previousQueue);
      }

      toast.error("Nao foi possivel reorganizar a fila.");
    },
    onSuccess: (items) => {
      queryClient.setQueryData([QUEUE_KEY], items);
      toast.success("Fila reorganizada com sucesso!");
    },
  });
};

const FindCustomers = () => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY],
    queryFn: getCustomers,
  });
};

const RedeemBenefit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => redeemBenefit(customerId),
    onSuccess: () => {
      toast.success("Beneficio resgatado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
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
  RedeemBenefit,
};
