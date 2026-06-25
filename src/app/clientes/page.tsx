"use client";

import { BodyContainer } from "@/components/BodyContainer";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useWashUp } from "@/hooks/washup/useWashUp";
import { formatPlateInput } from "@/lib/formatters";
import { useMemo, useState } from "react";

type SortBy = "name" | "points" | "visits";
type SortDirection = "asc" | "desc";

function ClientesContent() {
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { data: customersData, isLoading } = useWashUp.FindCustomers();

  const sortedClients = useMemo(() => {
    const customers = [...(customersData ?? [])];

    return customers.sort((firstCustomer, secondCustomer) => {
      let result = 0;

      if (sortBy === "name") {
        result = firstCustomer.name.localeCompare(secondCustomer.name);
      }

      if (sortBy === "points") {
        result = firstCustomer.loyaltyPoints - secondCustomer.loyaltyPoints;
      }

      if (sortBy === "visits") {
        result = firstCustomer.totalVisits - secondCustomer.totalVisits;
      }

      return sortDirection === "asc" ? result : result * -1;
    });
  }, [customersData, sortBy, sortDirection]);

  if (isLoading) {
    return <div className="p-8 text-title">Carregando clientes...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <BodyContainer>
        <section className="rounded-md bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-title">Clientes</h1>
            <p className="text-sm text-table-header">
              Consulte os clientes atendidos, frequência de visitas e pontos de
              fidelidade.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-title">
              Ordenar por
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                className="h-12 rounded-md border border-input-border bg-background px-4 text-title outline-none focus:border-primary"
              >
                <option value="name">Nome</option>
                <option value="points">Pontos</option>
                <option value="visits">Visitas</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-title">
              Direção
              <select
                value={sortDirection}
                onChange={(event) =>
                  setSortDirection(event.target.value as SortDirection)
                }
                className="h-12 rounded-md border border-input-border bg-background px-4 text-title outline-none focus:border-primary"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-220 border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    Nome
                  </th>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    Telefone
                  </th>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    CPF
                  </th>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    Placa
                  </th>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    Visitas
                  </th>
                  <th className="px-4 text-left text-table-header text-base font-medium">
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((customer) => (
                  <tr key={customer.id} className="h-16">
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background rounded-l-lg">
                      {customer.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background">
                      {customer.cpf ?? "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background">
                      {formatPlateInput(customer.plate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background">
                      {customer.totalVisits}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-title bg-background rounded-r-lg">
                      {customer.loyaltyPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </BodyContainer>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <ClientesContent />
    </ProtectedRoute>
  );
}
