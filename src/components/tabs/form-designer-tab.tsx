import type { FieldConfig, FieldWithValidation } from "@/types";
import { buildValidation } from "@/utils";
import { useState } from "react";
import type { ZodTypeAny } from "zod";
import { FormConfig } from "../../data";
import { AddFieldDialog } from "../add-field-dialog";
import { DynamicForm } from "../dynamic-form";

export function FormDesigner() {
  const [fields, setFields] = useState<FieldWithValidation<ZodTypeAny>[]>([]);

  const handleFormSubmit = (values: FieldConfig) => {
    setFields((prev) => [...prev, buildValidation(values)]);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddFieldDialog handleFormSubmit={handleFormSubmit} />
      <DynamicForm config={fields.length ? fields : FormConfig} />
    </div>
  );
}
