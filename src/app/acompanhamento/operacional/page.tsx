"use client";

import { BodyContainer } from "@/components/BodyContainer";
import { CardContainer } from "@/components/CardContainer";
import { FormModal } from "@/components/FormModal";
import { Header } from "@/components/Header";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth/useAuth";
import { useWashUp } from "@/hooks/washup/useWashUp";
import { canManageQueue } from "@/services/auth";
import {
  DashboardSummary,
  NewQueueItemData,
  QueueItem,
  UpdateQueueItemData,
} from "@/types/washup";
import { useEffect, useMemo, useState } from "react";

function DashboardContent() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(
    null
  );
  const [lastUpdate, setLastUpdate] = useState("");
  const { user } = useAuth();
  const canManage = canManageQueue(user);

  const { data: queueData, isLoading } = useWashUp.FindQueue();
  const { data: customersData } = useWashUp.FindCustomers();
  const { mutateAsync: createQueueItem } = useWashUp.CreateQueueItem();
  const { mutateAsync: updateQueueItem } = useWashUp.UpdateQueueItem();
  const { mutateAsync: advanceQueueItem } = useWashUp.AdvanceQueueItem();
  const { mutateAsync: cancelQueueItem } = useWashUp.CancelQueueItem();
  const { mutateAsync: changeQueuePriority } = useWashUp.ChangeQueuePriority();
  const { mutateAsync: reorderQueueItems } = useWashUp.ReorderQueueItems();

  useEffect(() => {
    setLastUpdate(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [queueData]);

  const handleOpenCreateModal = () => {
    setSelectedQueueItem(null);
    setIsFormModalOpen(true);
  };

  const handleSubmitQueueItem = async (item: NewQueueItemData) => {
    if (selectedQueueItem) {
      const updatedItem: UpdateQueueItemData = {
        id: selectedQueueItem.id,
        ...item,
      };

      await updateQueueItem(updatedItem);
      setSelectedQueueItem(null);
      return;
    }

    await createQueueItem(item);
  };

  const handleAdvance = async (id: string) => {
    await advanceQueueItem(id);
  };

  const handleEdit = (item: QueueItem) => {
    setSelectedQueueItem(item);
    setIsFormModalOpen(true);
  };

  const handleCancel = async (id: string) => {
    const shouldCancel = window.confirm("Deseja cancelar este atendimento?");

    if (shouldCancel) {
      await cancelQueueItem(id);
    }
  };

  const handlePriorityChange = async (id: string, direction: "UP" | "DOWN") => {
    await changeQueuePriority({ id, direction });
  };

  const handleQueueReorder = async (items: QueueItem[]) => {
    await reorderQueueItems(items);
  };

  const summary = useMemo<DashboardSummary>(() => {
    const queue = queueData ?? [];
    const customers = customersData ?? [];

    return {
      waiting: queue.filter((item) => item.status === "WAITING").length,
      washing: queue.filter((item) => item.status === "WASHING").length,
      done: queue.filter((item) => item.status === "DONE").length,
      recurringCustomers: customers.filter((customer) => customer.totalVisits > 1)
        .length,
    };
  }, [queueData, customersData]);

  if (isLoading) {
    return <div className="p-8 text-title">Carregando WashUp...</div>;
  }

  return (
    <div className="h-full min-h-screen">
      <Header />

      <BodyContainer>
        <CardContainer summary={summary} />

        <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-title">
              Fila de atendimento
            </h1>
            <p className="text-sm text-table-header">
              Acompanhe os veículos em atendimento e organize a operação do lava
              jato.
            </p>
            <p className="mt-1 text-sm text-table-header">
              Última atualização: {lastUpdate || "--:--"}
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-80"
            >
              Novo atendimento
            </button>
          )}
        </div>

        <KanbanBoard
          items={queueData ?? []}
          onAdvance={handleAdvance}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onPriorityChange={handlePriorityChange}
          onReorder={handleQueueReorder}
          canManage={canManage}
        />
      </BodyContainer>

      {isFormModalOpen && (
        <FormModal
          closeModal={() => {
            setIsFormModalOpen(false);
            setSelectedQueueItem(null);
          }}
          title={selectedQueueItem ? "Editar atendimento" : "Novo atendimento"}
          addQueueItem={handleSubmitQueueItem}
          queueItem={selectedQueueItem}
        />
      )}
    </div>
  );
}

export default function OperacionalPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
