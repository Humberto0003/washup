"use client";

import { CustomerPlateAccess } from "@/components/CustomerPlateAccess";
import { Input } from "@/components/Form/Input";
import { useAuth } from "@/hooks/auth/useAuth";
import { useWashUp } from "@/hooks/washup/useWashUp";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Home() {
  const { register, handleSubmit } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { signIn } = useAuth();
  const { data: queueData, isLoading: isQueueLoading } = useWashUp.FindQueue();
  const router = useRouter();

  const handleLogin = (data: LoginFormData) => {
    const user = signIn(data.email, data.password);

    if (!user) {
      toast.error("E-mail ou senha invalidos.");
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push("/acompanhamento/operacional");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-header sm:text-5xl">WashUp</h1>
          <p className="mt-3 text-base font-medium text-title">
            Gestao inteligente para lava jatos
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-2">
          <div className="p-6 sm:p-8">
            <span className="text-sm font-semibold uppercase text-primary">
              Operador
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-title">
              Acesso operacional
            </h2>
            <p className="mt-2 text-sm leading-6 text-table-header">
              Entre para gerenciar a fila de atendimento do lava jato.
            </p>

            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleSubmit(handleLogin)}
            >
              <Input type="email" placeholder="E-mail" {...register("email")} />
              <Input
                type="password"
                placeholder="Senha"
                {...register("password")}
              />

              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-primary px-4 py-4 text-sm font-semibold text-white hover:opacity-80"
              >
                Entrar como operador
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between bg-header p-6 text-white sm:p-8">
            <div>
              <span className="text-sm font-semibold uppercase text-white/70">
                Cliente
              </span>
              <h2 className="mt-2 text-2xl font-semibold">Sou cliente</h2>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Informe a placa do seu veiculo para acompanhar apenas o seu
                atendimento.
              </p>

              <CustomerPlateAccess
                queueItems={queueData ?? []}
                isLoading={isQueueLoading}
              />
            </div>

            <div className="mt-8 rounded-md bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">
                Programa de fidelidade: a cada 10 lavagens, o cliente ganha 1
                lavagem simples gratis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
