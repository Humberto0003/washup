"use client";

import { useWashUp } from "@/hooks/washup/useWashUp";
import { CUSTOMER_PLATE_STORAGE_KEY } from "@/lib/customerAccess";
import { formatPlateInput } from "@/lib/formatters";
import { QueueItem, QueueStatus } from "@/types/washup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusLabel: Record<QueueStatus, string> = {
  WAITING: "Aguardando",
  WASHING: "Em lavagem",
  DONE: "Finalizado",
};

const statusDescription: Record<QueueStatus, string> = {
  WAITING: "Seu veículo está na fila e será chamado em breve.",
  WASHING: "Seu veículo está em atendimento agora.",
  DONE: "Seu veículo já foi finalizado.",
};

const steps: { status: QueueStatus; title: string }[] = [
  { status: "WAITING", title: "Aguardando" },
  { status: "WASHING", title: "Em lavagem" },
  { status: "DONE", title: "Finalizado" },
];

const getExpectedExitLabel = (item: QueueItem) => {
  if (item.status === "DONE") {
    return "Disponivel para retirada";
  }

  return `Em aproximadamente ${item.etaMinutes} min`;
};

const formatEntryDate = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const VehicleProgress = ({ status }: { status: QueueStatus }) => {
  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <ol
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label="Progresso do atendimento"
    >
      {steps.map((step, index) => {
        const isActive = step.status === status;
        const isComplete = index <= currentIndex;

        return (
          <li
            key={step.status}
            aria-current={isActive ? "step" : undefined}
            className={`rounded-md border p-4 ${
              isComplete
                ? "border-primary bg-primary/10 text-title"
                : "border-card-border bg-background text-table-header"
            }`}
          >
            <div
              className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                isComplete ? "bg-primary text-white" : "bg-white text-table-header"
              }`}
            >
              {index + 1}
            </div>
            <p className="font-semibold">{step.title}</p>
            {isActive && (
              <p className="mt-1 text-sm text-table-header">Etapa atual</p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

const CustomerVehicleView = ({ item }: { item: QueueItem }) => {
  const expectedExit = getExpectedExitLabel(item);
  const plate = formatPlateInput(item.plate);

  return (
    <>
      <section className="rounded-md bg-white p-6 shadow-sm">
        <span className="text-sm font-semibold text-primary">WashUp</span>
        <p className="sr-only" role="status" aria-live="polite">
          Veículo placa {plate}. Etapa atual: {statusLabel[item.status]}.
          Previsão de saída: {expectedExit}.
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-title">
              Acompanhamento do veículo
            </h1>
            <p className="mt-2 max-w-2xl text-table-header">
              {statusDescription[item.status]}
            </p>
          </div>

          <span
            aria-label={`Placa do veículo ${plate}`}
            className="w-fit rounded-md bg-background px-4 py-2 text-lg font-semibold text-title"
          >
            {plate}
          </span>
        </div>

        <VehicleProgress status={item.status} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="rounded-md border border-card-border bg-white p-5 shadow-sm">
          <span className="text-sm text-table-header">Etapa atual</span>
          <strong className="mt-2 block text-2xl text-title">
            {statusLabel[item.status]}
          </strong>
        </article>

        <article className="rounded-md border border-card-border bg-white p-5 shadow-sm">
          <span className="text-sm text-table-header">Previsão de saída</span>
          <strong className="mt-2 block text-2xl text-title">
            {expectedExit}
          </strong>
        </article>

        <article className="rounded-md border border-card-border bg-white p-5 shadow-sm">
          <span className="text-sm text-table-header">Serviço contratado</span>
          <strong className="mt-2 block text-2xl text-title">
            {item.serviceType}
          </strong>
        </article>
      </section>

      <section className="mt-6 rounded-md bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-title">Dados do atendimento</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-background p-4">
            <span className="text-sm text-table-header">Cliente</span>
            <strong className="mt-1 block text-title">{item.customerName}</strong>
          </div>

          <div className="rounded-md bg-background p-4">
            <span className="text-sm text-table-header">Telefone</span>
            <strong className="mt-1 block text-title">{item.phone}</strong>
          </div>

          <div className="rounded-md bg-background p-4">
            <span className="text-sm text-table-header">Entrada</span>
            <strong className="mt-1 block text-title">
              {formatEntryDate(item.createdAt)}
            </strong>
          </div>

          <div className="rounded-md bg-background p-4">
            <span className="text-sm text-table-header">Posição na etapa</span>
            <strong className="mt-1 block text-title">
              {item.position > 0 ? item.position : "-"}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
};

export default function AcompanhamentoClientesPage() {
  const [customerPlate, setCustomerPlate] = useState("");
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const router = useRouter();
  const {
    data: queueItem,
    isError,
    isLoading,
    isFetching,
  } = useWashUp.FindTrackingByPlate(
    customerPlate,
    hasCheckedAccess && Boolean(customerPlate)
  );

  useEffect(() => {
    setCustomerPlate(sessionStorage.getItem(CUSTOMER_PLATE_STORAGE_KEY) ?? "");
    setHasCheckedAccess(true);
  }, []);

  const handleBackToAccess = () => {
    sessionStorage.removeItem(CUSTOMER_PLATE_STORAGE_KEY);
    router.push("/");
  };

  if (isLoading || isFetching || !hasCheckedAccess) {
    return <div className="p-8 text-title">Carregando acompanhamento...</div>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <section className="mx-auto w-full max-w-280">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleBackToAccess}
            className="rounded-md border border-card-border bg-white px-4 py-2 text-sm font-semibold text-title hover:bg-background"
          >
            Informar outra placa
          </button>
        </div>

        {!customerPlate && (
          <section className="rounded-md bg-white p-6 text-center shadow-sm">
            <span className="text-sm font-semibold text-primary">WashUp</span>
            <h1 className="mt-2 text-3xl font-semibold text-title">
              Informe sua placa
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-table-header">
              Para acessar o acompanhamento do cliente, volte ao início e informe
              a placa do veículo.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-80"
            >
              Voltar ao início
            </button>
          </section>
        )}

        {customerPlate && (isError || !queueItem) && (
          <section className="rounded-md bg-white p-6 text-center shadow-sm">
            <span className="text-sm font-semibold text-primary">WashUp</span>
            <h1 className="mt-2 text-3xl font-semibold text-title">
              Veículo não encontrado
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-table-header">
              A placa informada não está na fila atual. Confira a placa e tente
              novamente.
            </p>
            <button
              type="button"
              onClick={handleBackToAccess}
              className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-80"
            >
              Tentar novamente
            </button>
          </section>
        )}

        {queueItem && <CustomerVehicleView item={queueItem} />}

        <div className="mt-6 rounded-md border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-title">
            Programa de fidelidade: a cada 10 lavagens, você ganha 1 lavagem
            simples grátis.
          </p>
        </div>
      </section>
    </main>
  );
}
