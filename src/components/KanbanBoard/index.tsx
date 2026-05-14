import { QueueItem, QueueStatus } from "@/types/washup";
import { VehicleCard } from "../VehicleCard";

export type KanbanBoardProps = {
  items: QueueItem[];
  onAdvance: (id: string) => void;
  onEdit?: (item: QueueItem) => void;
  onCancel?: (id: string) => void;
  onPriorityChange?: (id: string, direction: "UP" | "DOWN") => void;
  canManage?: boolean;
};

const columns: { status: QueueStatus; title: string; accent: string }[] = [
  { status: "WAITING", title: "Aguardando", accent: "border-primary" },
  { status: "WASHING", title: "Em Lavagem", accent: "border-warning" },
  { status: "DONE", title: "Finalizado", accent: "border-success" },
];

export const KanbanBoard = ({
  items,
  onAdvance,
  onEdit,
  onCancel,
  onPriorityChange,
  canManage = false,
}: KanbanBoardProps) => {
  return (
    <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.status === column.status);

        return (
          <div
            key={column.status}
            className={`min-h-96 rounded-md border-t-4 ${column.accent} bg-white/50 p-4`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-title">{column.title}</h2>
              <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-title">
                {columnItems.length}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {columnItems.map((item) => (
                <VehicleCard
                  key={item.id}
                  item={item}
                  onAdvance={onAdvance}
                  onEdit={onEdit}
                  onCancel={onCancel}
                  onPriorityChange={onPriorityChange}
                  canManage={canManage}
                />
              ))}

              {columnItems.length === 0 && (
                <div className="rounded-md border border-dashed border-card-border bg-white p-6 text-center text-sm text-table-header">
                  Nenhum veiculo nesta etapa.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};
