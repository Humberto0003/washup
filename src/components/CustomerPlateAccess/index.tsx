"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Input } from "../Form/Input";
import {
  CustomerPlateAccessFormData,
  customerPlateAccessSchema,
  defaultValues,
} from "./schema";
import { formatPlateInput, getPlateRaw } from "@/lib/formatters";
import {
  CUSTOMER_PLATE_STORAGE_KEY,
  normalizePlate,
} from "@/lib/customerAccess";
import { useWashUp } from "@/hooks/washup/useWashUp";
import { getApiErrorMessage } from "@/services/apiClient";

export type CustomerPlateAccessProps = {
  isLoading?: boolean;
};

export const CustomerPlateAccess = ({
  isLoading = false,
}: CustomerPlateAccessProps) => {
  const router = useRouter();
  const [accessMessage, setAccessMessage] = useState("");
  const [submittedPlate, setSubmittedPlate] = useState("");
  const handledPlateRef = useRef("");
  const tracking = useWashUp.FindTrackingByPlate(
    submittedPlate,
    Boolean(submittedPlate)
  );
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

  useEffect(() => {
    if (
      !submittedPlate ||
      tracking.isFetching ||
      handledPlateRef.current === submittedPlate
    ) {
      return;
    }

    if (tracking.isSuccess && tracking.data) {
      sessionStorage.setItem(
        CUSTOMER_PLATE_STORAGE_KEY,
        normalizePlate(tracking.data.plate)
      );
      setAccessMessage("Veículo encontrado. Abrindo acompanhamento.");
      toast.success("Veículo encontrado! Abrindo acompanhamento.");
      handledPlateRef.current = submittedPlate;
      router.push("/acompanhamento/clientes");
    }

    if (tracking.isError) {
      setAccessMessage("Não encontramos nenhum veículo com essa placa.");
      toast.error(getApiErrorMessage(tracking.error));
      handledPlateRef.current = submittedPlate;
    }
  }, [
    router,
    submittedPlate,
    tracking.data,
    tracking.error,
    tracking.isError,
    tracking.isFetching,
    tracking.isSuccess,
  ]);

  const handleCustomerAccess = (data: CustomerPlateAccessFormData) => {
    const plate = getPlateRaw(data.plate);
    handledPlateRef.current = "";
    setSubmittedPlate(plate);

    if (plate === submittedPlate) {
      tracking.refetch();
    }
  };

  const isChecking = isLoading || tracking.isFetching;

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
        aria-busy={isChecking}
        onChange={(event) => {
          const value = formatPlateInput(event.target.value);
          setValue("plate", value, { shouldValidate: true });
        }}
        error={errors.plate?.message}
      />

      <button
        type="submit"
        disabled={isChecking}
        className="w-full rounded-md bg-white px-4 py-4 text-sm font-semibold text-header hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isChecking ? "Consultando fila..." : "Acompanhar meu veículo"}
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
