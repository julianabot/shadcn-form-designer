import { AddFieldDialog, DynamicForm } from "@/components";
import type { FieldConfig, FieldWithValidation } from "@/types";
import { buildSchema, buildValidation } from "@/utils";
import { useState } from "react";
import type { z, ZodTypeAny } from "zod";
import { FormConfig } from "../../data";

export function FormDesigner() {
  const [fields, setFields] = useState<FieldWithValidation<ZodTypeAny>[]>([]);

  const handleAddField = (values: FieldConfig) => {
    setFields((prev) => [...prev, buildValidation(values)]);
    console.log("New Field Added:", values);
  };

  const onSubmitForm = (
    data:
      | z.infer<ReturnType<typeof buildSchema>>
      | FieldWithValidation<ZodTypeAny>[],
    isBuilderMode: boolean
  ) => {
    console.log("Is builder mode:", isBuilderMode);
    console.log("Form Submitted:", data);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddFieldDialog handleAddField={handleAddField} />
      <DynamicForm
        config={fields.length ? fields : FormConfig}
        onSubmitForm={onSubmitForm}
        isBuilderMode={false}
      />
    </div>
  );
}
