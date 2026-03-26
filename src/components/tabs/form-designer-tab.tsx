import { AddFieldDialog, DynamicForm } from "@/components";
import { FormConfig } from "@/data";
import type {
  FieldConfig,
  FieldWithValidation,
  SerializableFieldConfig,
} from "@/types";
import { buildSchema, toSerializableField } from "@/utils";
import { useState } from "react";
import type { z, ZodTypeAny } from "zod";

export function FormDesigner() {
  const [fields, setFields] = useState<SerializableFieldConfig[]>([]);

  const handleAddField = (values: FieldConfig) => {
    const serializable = toSerializableField(values);
    setFields((prev) => [...prev, serializable]);
    console.log(
      "New Field Added (serializable):",
      JSON.stringify(serializable),
    );
  };

  const onSubmitForm = (
    data:
      | z.infer<ReturnType<typeof buildSchema>>
      | FieldWithValidation<ZodTypeAny>[],
    isBuilderMode: boolean,
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
