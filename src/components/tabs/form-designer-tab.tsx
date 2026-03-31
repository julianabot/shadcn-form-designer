import { AddFieldDialog, DynamicForm } from "@/components";
import { FormConfig } from "@/data";
import type {
  FieldConfig,
  FieldWithValidation,
  FormLayout,
  SerializableFieldConfig,
} from "@/types";
import { toFormLayout, toSerializableField } from "@/utils";
import { useState } from "react";
import type { ZodTypeAny } from "zod";

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

  const formConfig: FormLayout = fields.length
    ? toFormLayout(fields)
    : FormConfig;

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddFieldDialog handleAddField={handleAddField} />
      <DynamicForm
        config={formConfig}
        onSubmit={(data) => console.log("Form Submitted:", data)}
        onSubmitFieldConfig={(fields: FieldWithValidation<ZodTypeAny>[]) =>
          console.log("Field configs:", fields)
        }
      />
    </div>
  );
}
