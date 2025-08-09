import { FormConfig } from "../data";
import { DynamicForm } from "./dynamic-form";

export function FormDesigner() {
  return (
    <div className="w-full flex flex-col justify-center items-cente">
      <DynamicForm config={FormConfig} />
    </div>
  );
}
