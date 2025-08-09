import { FormConfig } from "../../data";
import { AddFieldDialog } from "../add-field-dialog";
import { DynamicForm } from "../dynamic-form";

export function FormDesigner() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddFieldDialog />
      <DynamicForm config={FormConfig} />
    </div>
  );
}
