import type { FieldConfig } from "@/types";
import { FormConfig } from "../../data";
import { AddFieldDialog } from "../add-field-dialog";
import { DynamicForm } from "../dynamic-form";

export function FormDesigner() {
  const handleFormSubmit = (values: FieldConfig) => {
    console.log(values);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddFieldDialog handleFormSubmit={handleFormSubmit} />
      <DynamicForm config={FormConfig} />
    </div>
  );
}
