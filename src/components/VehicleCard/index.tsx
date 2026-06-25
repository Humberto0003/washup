import { QueueItem, QueueStatus } from "@/types/washup";
import { formatPlateInput } from "@/lib/formatters";

export type VehicleCardProps = {
  item: QueueItem;
  onAdvance: (id: string) => void;
  onEdit?: (item: QueueItem) => void;
  onCancel?: (id: string) => void;
  onPriorityChange?: (id: string, direction: "UP" | "DOWN") => void;
  onMoveToStatus?: (id: string, status: QueueStatus) => void;
  onMovePosition?: (id: string, direction: "UP" | "DOWN") => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canManage?: boolean;
};

const statusAction = {
  WAITING: "Iniciar lavagem",
  WASHING: "Finalizar",
  DONE: "Finalizado",
};

const statusLabel: Record<QueueStatus, string> = {
  WAITING: "Aguardando",
  WASHING: "Em lavagem",
  DONE: "Finalizado",
};

const statusOptions: QueueStatus[] = ["WAITING", "WASHING", "DONE"];

export const VehicleCard = ({
  item,
  onAdvance,
  onEdit,
  onCancel,
  onPriorityChange,
  onMoveToStatus,
  onMovePosition,
  canMoveUp = false,
  canMoveDown = false,
  canManage = false,
}: VehicleCardProps) => {
  const isDone = item.status === "DONE";
  const plate = formatPlateInput(item.plate);

  return (
    <article
      className="rounded-md bg-white p-4 shadow-sm border border-card-border"
      aria-label={`Atendimento de ${item.customerName}, placa ${plate}, status ${statusLabel[item.status]}, posição ${item.position > 0 ? item.position : "sem posição"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-title font-semibold">{item.customerName}</h3>
          <p className="text-sm text-table-header">{item.phone}</p>
          {item.cpf && <p className="text-sm text-table-header">CPF {item.cpf}</p>}
        </div>
        <span className="rounded-md bg-background px-3 py-1 text-sm font-semibold text-title">
          {plate}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-table-header">Serviço</span>
          <strong className="font-medium text-title">{item.serviceType}</strong>
        </div>
        <div>
          <span className="block text-table-header">Posição</span>
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
            aria-label={`${statusAction[item.status]} do veículo ${plate}`}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-80 disabled:cursor-not-allowed disabled:bg-success disabled:hover:opacity-100"
          >
            {statusAction[item.status]}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              aria-label={`Editar atendimento do veículo ${plate}`}
              className="rounded-md border border-card-border px-3 py-2 text-sm font-semibold text-title hover:bg-background"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onCancel?.(item.id)}
              aria-label={`Cancelar atendimento do veículo ${plate}`}
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
                aria-label={`Mover veículo ${plate} para cima na fila`}
                className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80"
              >
                Subir
              </button>
              <button
                type="button"
                onClick={() => onPriorityChange?.(item.id, "DOWN")}
                aria-label={`Mover veículo ${plate} para baixo na fila`}
                className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80"
              >
                Descer
              </button>
            </div>
          )}

          {onMoveToStatus && (
            <div
              className="rounded-md border border-card-border p-3"
              aria-label={`Alternativas acessíveis para organizar o veículo ${plate}`}
            >
              <p className="mb-2 text-sm font-semibold text-title">
                Organizar no Kanban
              </p>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions
                  .filter((status) => status !== item.status)
                  .map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onMoveToStatus(item.id, status)}
                      className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80"
                    >
                      Mover para {statusLabel[status]}
                    </button>
                  ))}
              </div>

              {onMovePosition && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={() => onMovePosition(item.id, "UP")}
                    aria-label={`Mover veículo ${plate} para cima na coluna ${statusLabel[item.status]}`}
                    className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={() => onMovePosition(item.id, "DOWN")}
                    aria-label={`Mover veículo ${plate} para baixo na coluna ${statusLabel[item.status]}`}
                    className="rounded-md bg-background px-3 py-2 text-sm font-semibold text-title hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Descer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
