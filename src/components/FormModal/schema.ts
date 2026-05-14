import { InferType, object, string } from "yup";
import { getCpfDigits, getPhoneDigits, isValidPlate } from "@/lib/formatters";

export const queueItemSchema = object({
  customerName: string()
    .required("O nome do cliente e obrigatorio")
    .min(3, "Informe pelo menos 3 caracteres"),

  phone: string()
    .required("O telefone e obrigatorio")
    .test(
      "phone-length",
      "Informe um telefone com 11 digitos",
      (value) => getPhoneDigits(value ?? "").length === 11
    ),

  cpf: string()
    .defined()
    .test("cpf-length", "Informe um CPF com 11 digitos", (value) => {
      if (!value) {
        return true;
      }

      return getCpfDigits(value).length === 11;
    }),

  plate: string()
    .required("A placa e obrigatoria")
    .defined()
    .test("plate-format", "Informe uma placa valida", (value) => {
      if (!value) {
        return false;
      }

      return isValidPlate(value);
    }),

  serviceType: string()
    .required("O tipo de servico e obrigatorio")
    .oneOf(
      ["Lavagem simples", "Lavagem completa", "Higienizacao interna", "Polimento"],
      "Selecione um servico valido"
    ),
});

export type QueueItemFormData = InferType<typeof queueItemSchema>;

export const defaultValues: QueueItemFormData = {
  customerName: "",
  phone: "",
  cpf: "",
  plate: "",
  serviceType: "Lavagem simples",
};
