"use client";

import { useWashUp } from "@/hooks/washup/useWashUp";
import { maskClientName, maskPlate } from "@/lib/maskers";
import { QueueItem, QueueStatus } from "@/types/washup";
import { formatPlateInput } from "@/lib/formatters";
import { useRouter } from "next/navigation";

const statusLabel: Record<QueueStatus, string> = {
  WAITING: "Aguardando",
  WASHING: "Em lavagem",
  DONE: "Finalizado",
};

const columns: { status: QueueStatus; title: string; accent: string }[] = [
  { status: "WAITING", title: "Aguardando", accent: "border-primary" },
  { status: "WASHING", title: "Em lavagem", accent: "border-warning" },
  { status: "DONE", title: "Finalizado", accent: "border-success" },
];

const PublicVehicleCard = ({ item }: { item: QueueItem }) => {
  return (
    <article className="rounded-md border border-card-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-title">
            {maskClientName(item.customerName)}
          </h3>
          <p className="text-sm text-table-header">{item.serviceType}</p>
        </div>

        <span className="rounded-md bg-background px-3 py-1 text-sm font-semibold text-title">
          {maskPlate(formatPlateInput(item.plate))}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-table-header">Status</span>
          <strong className="font-medium text-title">
            {statusLabel[item.status]}
          </strong>
        </div>
        <div>
          <span className="block text-table-header">Posicao</span>
          <strong className="font-medium text-title">
            {item.position > 0 ? item.position : "-"}
          </strong>
        </div>
        <div>
          <span className="block text-table-header">Tempo medio estimado</span>
          <strong className="font-medium text-title">{item.etaMinutes} min</strong>
        </div>
        <div>
          <span className="block text-table-header">Servico</span>
          <strong className="font-medium text-title">{item.serviceType}</strong>
        </div>
      </div>
    </article>
  );
};

export default function AcompanhamentoClientesPage() {
  const { data: queueData, isLoading } = useWashUp.FindQueue();
  const router = useRouter();

  if (isLoading) {
    return <div className="p-8 text-title">Carregando acompanhamento...</div>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <section className="mx-auto w-full max-w-280">
        <div className="rounded-md bg-white p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-md border border-card-border px-4 py-2 text-sm font-semibold text-title hover:bg-background"
            >
              Voltar ao inicio
            </button>
          </div>

          <span className="text-sm font-semibold text-primary">WashUp</span>
          <h1 className="mt-2 text-3xl font-semibold text-title">
            Fila de atendimento
          </h1>
          <p className="mt-2 text-table-header">
            Acompanhe o andamento dos veiculos em atendimento.
          </p>
        </div>

        <div className="mt-5 rounded-md border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-title">
            Programa de fidelidade: a cada 10 lavagens, voce ganha 1 lavagem
            simples gratis.
          </p>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {columns.map((column) => {
            const columnItems = (queueData ?? []).filter(
              (item) => item.status === column.status
            );

            return (
              <div
                key={column.status}
                className={`min-h-96 rounded-md border-t-4 ${column.accent} bg-white/50 p-4`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-title">
                    {column.title}
                  </h2>
                  <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-title">
                    {columnItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {columnItems.map((item) => (
                    <PublicVehicleCard key={item.id} item={item} />
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
      </section>
    </main>
  );
}
