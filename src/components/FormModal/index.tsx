import { useEffect } from "react";
import { Input } from "../Form/Input";
import { QueueItemFormData, queueItemSchema, defaultValues } from "./schema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewQueueItemData, QueueItem, WashServiceType } from "@/types/washup";
import {
  formatCpf,
  formatPhone,
  formatPlateInput,
  getPlateRaw,
} from "@/lib/formatters";

export type FormModalProps = {
  title: string;
  closeModal: () => void;
  addQueueItem: (item: NewQueueItemData) => void;
  queueItem?: QueueItem | null;
};

export const FormModal = ({
  title,
  closeModal,
  addQueueItem,
  queueItem,
}: FormModalProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
  } = useForm<QueueItemFormData>({
    resolver: yupResolver(queueItemSchema),
    defaultValues,
  });

  useEffect(() => {
    if (queueItem) {
      reset({
        customerName: queueItem.customerName,
        phone: formatPhone(queueItem.phone),
        cpf: formatCpf(queueItem.cpf ?? ""),
        plate: formatPlateInput(queueItem.plate),
        serviceType: queueItem.serviceType,
      });
    }
  }, [queueItem, reset]);

  const phoneRegister = register("phone");
  const cpfRegister = register("cpf");
  const plateRegister = register("plate");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  const handleSubmitForm = (data: QueueItemFormData) => {
    addQueueItem({
      customerName: data.customerName,
      phone: formatPhone(data.phone),
      cpf: data.cpf ? formatCpf(data.cpf) : undefined,
      plate: getPlateRaw(data.plate),
      serviceType: data.serviceType as WashServiceType,
    });
    closeModal();
  };

  return (
    <div
      className="relative z-10 min-w-xl"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-700 opacity-75 transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-modal text-left shadow-xl sm:w-full sm:max-w-lg">
            <button
              type="button"
              className="absolute top-0 right-0 mt-4 mr-5 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
              aria-label="Fechar"
            >
              <span className="text-2xl">&times;</span>
            </button>

            <div className="bg-modal px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h1
                    className="font-semibold leading-9 text-title text-2xl"
                    id="modal-title"
                  >
                    {title}
                  </h1>
                </div>
              </div>
            </div>

            <form
              className="flex flex-col gap-4 px-6 sm:px-12 mt-4 mb-6"
              onSubmit={handleSubmit(handleSubmitForm)}
            >
              <Input
                type="text"
                placeholder="Nome do cliente"
                {...register("customerName")}
                error={errors.customerName?.message}
              />

              <Input
                type="tel"
                placeholder="Telefone"
                {...phoneRegister}
                inputMode="numeric"
                maxLength={15}
                onChange={(event) => {
                  const value = formatPhone(event.target.value);
                  setValue("phone", value, { shouldValidate: true });
                }}
                error={errors.phone?.message}
              />

              <Input
                type="text"
                placeholder="CPF (opcional)"
                {...cpfRegister}
                inputMode="numeric"
                maxLength={14}
                onChange={(event) => {
                  const value = formatCpf(event.target.value);
                  setValue("cpf", value, { shouldValidate: true });
                }}
                error={errors.cpf?.message}
              />

              <Input
                type="text"
                placeholder="Placa"
                {...plateRegister}
                maxLength={8}
                onChange={(event) => {
                  const value = formatPlateInput(event.target.value);
                  setValue("plate", value, { shouldValidate: true });
                }}
                error={errors.plate?.message}
              />

              <div className="flex flex-col gap-1">
                <select
                  {...register("serviceType")}
                  className="w-full h-16 px-6 py-5 bg-background text-title border border-input-border rounded-md outline-none focus:border-primary"
                >
                  <option>Lavagem simples</option>
                  <option>Lavagem completa</option>
                  <option>Higienizacao interna</option>
                  <option>Polimento</option>
                </select>
                {errors.serviceType && (
                  <span className="text-danger text-sm px-2">
                    {errors.serviceType.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="mt-6 mb-16 w-full justify-center rounded-md bg-primary text-white px-3 py-5 text-normal font-semibold shadow-sm hover:opacity-80"
              >
                {queueItem ? "Salvar atendimento" : "Adicionar a fila"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
