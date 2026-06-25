"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Input } from "../Form/Input";
import {
  CustomerPlateAccessFormData,
  customerPlateAccessSchema,
  defaultValues,
} from "./schema";
import { formatPlateInput } from "@/lib/formatters";
import {
  CUSTOMER_PLATE_STORAGE_KEY,
  findQueueItemByPlate,
  normalizePlate,
} from "@/lib/customerAccess";
import { QueueItem } from "@/types/washup";

export type CustomerPlateAccessProps = {
  queueItems: QueueItem[];
  isLoading?: boolean;
};

export const CustomerPlateAccess = ({
  queueItems,
  isLoading = false,
}: CustomerPlateAccessProps) => {
  const router = useRouter();
  const [accessMessage, setAccessMessage] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<CustomerPlateAccessFormData>({
    resolver: yupResolver(customerPlateAccessSchema),
    defaultValues,
  });

  const plateRegister = register("plate");

  const handleCustomerAccess = (data: CustomerPlateAccessFormData) => {
    const queueItem = findQueueItemByPlate(queueItems, data.plate);

    if (!queueItem) {
      setAccessMessage("Não encontramos nenhum veículo com essa placa.");
      toast.error("Não encontramos nenhum veículo com essa placa.");
      return;
    }

    sessionStorage.setItem(
      CUSTOMER_PLATE_STORAGE_KEY,
      normalizePlate(queueItem.plate)
    );
    setAccessMessage("Veículo encontrado. Abrindo acompanhamento.");
    toast.success("Veículo encontrado! Abrindo acompanhamento.");
    router.push("/acompanhamento/clientes");
  };

  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={handleSubmit(handleCustomerAccess)}
    >
      <Input
        type="text"
        label="Placa do veículo"
        placeholder="Placa do veículo"
        {...plateRegister}
        maxLength={8}
        autoComplete="off"
        required
        aria-busy={isLoading}
        onChange={(event) => {
          const value = formatPlateInput(event.target.value);
          setValue("plate", value, { shouldValidate: true });
        }}
        error={errors.plate?.message}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-white px-4 py-4 text-sm font-semibold text-header hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Consultando fila..." : "Acompanhar meu veículo"}
      </button>

      {accessMessage && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white"
        >
          {accessMessage}
        </p>
      )}
    </form>
  );
};
