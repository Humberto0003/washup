import { InferType, object, string } from "yup";
import { isValidPlate } from "@/lib/formatters";

export const customerPlateAccessSchema = object({
  plate: string()
    .required("Informe a placa do veículo")
    .defined()
    .test("plate-format", "Informe uma placa válida", (value) => {
      if (!value) {
        return false;
      }

      return isValidPlate(value);
    }),
});

export type CustomerPlateAccessFormData = InferType<
  typeof customerPlateAccessSchema
>;

export const defaultValues: CustomerPlateAccessFormData = {
  plate: "",
};
