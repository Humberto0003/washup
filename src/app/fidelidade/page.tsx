"use client";

import { BodyContainer } from "@/components/BodyContainer";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useWashUp } from "@/hooks/washup/useWashUp";
import { formatPlateInput } from "@/lib/formatters";
import { useMemo } from "react";

function FidelidadeContent() {
  const { data: customersData, isLoading } = useWashUp.FindCustomers();
  const { mutateAsync: redeemBenefit } = useWashUp.RedeemBenefit();

  const customers = useMemo(() => customersData ?? [], [customersData]);

  const summary = useMemo(() => {
    const eligibleCustomers = customers.filter(
      (customer) => customer.loyaltyPoints >= 10
    );
    const totalPoints = customers.reduce(
      (total, customer) => total + customer.loyaltyPoints,
      0
    );

    return {
      participants: customers.length,
      eligible: eligibleCustomers.length,
      totalPoints,
      availableBenefits: eligibleCustomers.length,
    };
  }, [customers]);

  if (isLoading) {
    return <div className="p-8 text-title">Carregando fidelidade...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <BodyContainer>
        <section>
          <div className="mb-5 rounded-md bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-title">Fidelidade</h1>
            <p className="mt-2 text-sm text-table-header">
              Acompanhe os pontos acumulados e os clientes elegíveis a
              benefícios.
            </p>
          </div>

          <div className="mb-5 rounded-md border border-success/30 bg-success/10 p-4">
            <p className="text-sm font-semibold text-title">
              Programa de fidelidade: a cada 10 lavagens, o cliente ganha 1
              lavagem simples grátis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md bg-white p-5 shadow-sm">
              <span className="text-sm text-table-header">
                Clientes participantes
              </span>
              <strong className="mt-2 block text-3xl font-semibold text-title">
                {summary.participants}
              </strong>
            </div>
            <div className="rounded-md bg-white p-5 shadow-sm">
              <span className="text-sm text-table-header">
                Clientes elegíveis
              </span>
              <strong className="mt-2 block text-3xl font-semibold text-success">
                {summary.eligible}
              </strong>
            </div>
            <div className="rounded-md bg-white p-5 shadow-sm">
              <span className="text-sm text-table-header">
                Total de pontos acumulados
              </span>
              <strong className="mt-2 block text-3xl font-semibold text-primary">
                {summary.totalPoints}
              </strong>
            </div>
            <div className="rounded-md bg-white p-5 shadow-sm">
              <span className="text-sm text-table-header">
                Benefícios disponíveis
              </span>
              <strong className="mt-2 block text-3xl font-semibold text-warning">
                {summary.availableBenefits}
              </strong>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {customers.map((customer) => {
              const canRedeem = customer.loyaltyPoints >= 10;
              const progress = Math.min((customer.loyaltyPoints / 10) * 100, 100);

              return (
                <article
                  key={customer.id}
                  className={`rounded-md bg-white p-5 shadow-sm border ${
                    canRedeem ? "border-success" : "border-card-border"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-title">
                        {customer.name}
                      </h2>
                      <p className="text-sm text-table-header">
                        {customer.phone}
                      </p>
                      {customer.cpf && (
                        <p className="text-sm text-table-header">
                          CPF {customer.cpf}
                        </p>
                      )}
                      <p className="text-sm text-table-header">
                        Placa {formatPlateInput(customer.plate)}
                      </p>
                    </div>

                    <span
                      className={`rounded-md px-3 py-1 text-sm font-semibold ${
                        canRedeem
                          ? "bg-success/10 text-success"
                          : "bg-background text-title"
                      }`}
                    >
                      {canRedeem ? "Elegível ao benefício" : "Em progresso"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-table-header">Pontos</span>
                      <strong className="text-lg font-semibold text-title">
                        {customer.loyaltyPoints}/10
                      </strong>
                    </div>

                    <div className="h-3 rounded-full bg-background">
                      <div
                        className="h-3 rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {canRedeem && (
                    <button
                      type="button"
                      onClick={() => redeemBenefit(customer.id)}
                      className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-80"
                    >
                      Resgatar benefício
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </BodyContainer>
    </div>
  );
}

export default function FidelidadePage() {
  return (
    <ProtectedRoute>
      <FidelidadeContent />
    </ProtectedRoute>
  );
}
