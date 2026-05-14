import { DashboardSummary } from "@/types/washup";
import { Card } from "../Card";

export type CardContainerProps = {
  summary: DashboardSummary;
};

export const CardContainer = ({ summary }: CardContainerProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Veiculos aguardando"
        amount={summary.waiting}
        description="Na fila de atendimento"
        tone="blue"
      />
      <Card
        title="Veiculos em lavagem"
        amount={summary.washing}
        description="Em execucao agora"
        tone="yellow"
      />
      <Card
        title="Veiculos finalizados"
        amount={summary.done}
        description="Entregues hoje"
        tone="green"
      />
      <Card
        title="Clientes recorrentes"
        amount={summary.recurringCustomers}
        description="Mais de uma visita"
        tone="teal"
      />
    </div>
  );
};
