import { QueueItem } from "@/types/washup";
import { formatPlateInput } from "@/lib/formatters";

export type VehicleCardProps = {
  item: QueueItem;
  onAdvance: (id: string) => void;
  onEdit?: (item: QueueItem) => void;
  onCancel?: (id: string) => void;
  onPriorityChange?: (id: string, direction: "UP" | "DOWN") => void;
  canManage?: boolean;
};

const statusAction = {
  WAITING: "Iniciar lavagem",
  WASHING: "Finalizar",
  DONE: "Finalizado",
};

export const VehicleCard = ({
  item,
  onAdvance,
  onEdit,
  onCancel,
  onPriorityChange,
  canManage = false,
}: VehicleCardProps) => {
  const isDone = item.status === "DONE";

  return (
    <article className="rounded-md bg-white p-4 shadow-sm border border-card-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-title font-semibold">{item.customerName}</h3>
          <p className="text-sm text-table-header">{item.phone}</p>
          {item.cpf && <p className="text-sm text-table-header">CPF {item.cpf}</p>}
        </div>
        <span className="rounded-md bg-background px-3 py-1 text-sm font-semibold text-title">
          {formatPlateInput(item.plate)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-table-header">Servico</span>
          <strong className="font-medium text-title">{item.serviceType}</strong>
        </div>
        <div>
          <span className="block text-table-header">Posicao</span>
          <strong className="font-medium text-title">
            {item.position > 0 ? item.position : "-"}
          </strong>
        </div>
        <div>
          <span className="block text-table-header">Tempo medio</span>
          <strong className="font-medium text-title">
            {item.etaMinutes} min
          </strong>
        </div>
      </div>

      {canManage && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={isDone}
            onClick={() => onAdvance(item.id)}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-80 disabled:cursor-not-allowed disabled:bg-success disabled:hover:opacity-100"
          >
            {statusAction[item.status]}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="rounded-md border border-card-border px-3 py-2 text-sm font-semibold text-title hover:bg-background"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onCancel?.(item.id)}
              className="rounded-md border border-danger px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
            >
              Cancelar
            </button>
          </div>

          {item.status === "WAITING" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPriorityChange?.(item.id, "UP")}
                className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80"
              >
                Subir
              </button>
              <button
                type="button"
                onClick={() => onPriorityChange?.(item.id, "DOWN")}
                className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80"
              >
                Descer
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
