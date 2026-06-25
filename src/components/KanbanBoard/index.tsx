"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QueueItem, QueueStatus } from "@/types/washup";
import { VehicleCard, type VehicleCardProps } from "../VehicleCard";
import { type ReactNode, useMemo, useState } from "react";

export type KanbanBoardProps = {
  items: QueueItem[];
  onAdvance: (id: string) => void;
  onEdit?: (item: QueueItem) => void;
  onCancel?: (id: string) => void;
  onPriorityChange?: (id: string, direction: "UP" | "DOWN") => void;
  onReorder?: (items: QueueItem[]) => void;
  canManage?: boolean;
};

const columns: { status: QueueStatus; title: string; accent: string }[] = [
  { status: "WAITING", title: "Aguardando", accent: "border-primary" },
  { status: "WASHING", title: "Em Lavagem", accent: "border-warning" },
  { status: "DONE", title: "Finalizado", accent: "border-success" },
];

type ItemsByStatus = Record<QueueStatus, QueueItem[]>;

const columnStatuses = columns.map((column) => column.status);

const isQueueStatus = (id: UniqueIdentifier): id is QueueStatus =>
  columnStatuses.includes(String(id) as QueueStatus);

const buildItemsByStatus = (items: QueueItem[]) =>
  columnStatuses.reduce<ItemsByStatus>(
    (groups, status) => ({
      ...groups,
      [status]: items.filter((item) => item.status === status),
    }),
    {
      WAITING: [],
      WASHING: [],
      DONE: [],
    }
  );

const findItemStatus = (
  id: UniqueIdentifier,
  itemsByStatus: ItemsByStatus
) => {
  if (isQueueStatus(id)) {
    return id;
  }

  return columnStatuses.find((status) =>
    itemsByStatus[status].some((item) => item.id === id)
  );
};

const normalizeItems = (itemsByStatus: ItemsByStatus) =>
  columnStatuses.flatMap((status) =>
    itemsByStatus[status].map((item, index) => ({
      ...item,
      status,
      position: status === "DONE" ? 0 : index + 1,
      etaMinutes:
        status === "DONE" ? 0 : status === "WASHING" ? 15 : (index + 1) * 20 + 5,
    }))
  );

type DroppableColumnProps = {
  status: QueueStatus;
  accent: string;
  title: string;
  items: QueueItem[];
  children: ReactNode;
};

const DroppableColumn = ({
  status,
  accent,
  title,
  items,
  children,
}: DroppableColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 rounded-md border-t-4 ${accent} bg-white/50 p-4 transition-colors ${
        isOver ? "bg-white ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-title">{title}</h2>
        <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-title">
          {items.length}
        </span>
      </div>

      {children}
    </div>
  );
};

type SortableVehicleCardProps = VehicleCardProps & {
  disabled: boolean;
};

const SortableVehicleCard = ({
  disabled,
  ...vehicleCardProps
}: SortableVehicleCardProps) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: vehicleCardProps.item.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`touch-manipulation ${disabled ? "" : "cursor-grab active:cursor-grabbing"} ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <VehicleCard {...vehicleCardProps} />
    </div>
  );
};

export const KanbanBoard = ({
  items,
  onAdvance,
  onEdit,
  onCancel,
  onPriorityChange,
  onReorder,
  canManage = false,
}: KanbanBoardProps) => {
  const [activeItem, setActiveItem] = useState<QueueItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemsByStatus = useMemo(() => buildItemsByStatus(items), [items]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const item = items.find((queueItem) => queueItem.id === active.id);
    setActiveItem(item ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null);

    if (!over || active.id === over.id) {
      return;
    }

    const sourceStatus = findItemStatus(active.id, itemsByStatus);
    const targetStatus = findItemStatus(over.id, itemsByStatus);

    if (!sourceStatus || !targetStatus) {
      return;
    }

    const activeItemIndex = itemsByStatus[sourceStatus].findIndex(
      (item) => item.id === active.id
    );
    const activeQueueItem = itemsByStatus[sourceStatus][activeItemIndex];

    if (!activeQueueItem) {
      return;
    }

    const nextItemsByStatus: ItemsByStatus = {
      WAITING: [...itemsByStatus.WAITING],
      WASHING: [...itemsByStatus.WASHING],
      DONE: [...itemsByStatus.DONE],
    };

    if (sourceStatus === targetStatus) {
      const overItemIndex = nextItemsByStatus[targetStatus].findIndex(
        (item) => item.id === over.id
      );

      if (overItemIndex < 0) {
        return;
      }

      nextItemsByStatus[targetStatus] = arrayMove(
        nextItemsByStatus[targetStatus],
        activeItemIndex,
        overItemIndex
      );
    } else {
      nextItemsByStatus[sourceStatus].splice(activeItemIndex, 1);

      const overItemIndex = nextItemsByStatus[targetStatus].findIndex(
        (item) => item.id === over.id
      );
      const targetIndex =
        overItemIndex >= 0 ? overItemIndex : nextItemsByStatus[targetStatus].length;

      nextItemsByStatus[targetStatus].splice(targetIndex, 0, {
        ...activeQueueItem,
        status: targetStatus,
      });
    }

    onReorder?.(normalizeItems(nextItemsByStatus));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItem(null)}
    >
      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const columnItems = itemsByStatus[column.status];

          return (
            <DroppableColumn
              key={column.status}
              status={column.status}
              title={column.title}
              accent={column.accent}
              items={columnItems}
            >
              <SortableContext
                items={columnItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex min-h-72 flex-col gap-4">
                  {columnItems.map((item) => (
                    <SortableVehicleCard
                      key={item.id}
                      item={item}
                      onAdvance={onAdvance}
                      onEdit={onEdit}
                      onCancel={onCancel}
                      onPriorityChange={onPriorityChange}
                      canManage={canManage}
                      disabled={!canManage}
                    />
                  ))}

                  {columnItems.length === 0 && (
                    <div className="rounded-md border border-dashed border-card-border bg-white p-6 text-center text-sm text-table-header">
                      Nenhum veiculo nesta etapa.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </section>

      <DragOverlay>
        {activeItem ? (
          <div className="cursor-grabbing opacity-90">
            <VehicleCard
              item={activeItem}
              onAdvance={onAdvance}
              onEdit={onEdit}
              onCancel={onCancel}
              onPriorityChange={onPriorityChange}
              canManage={canManage}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
