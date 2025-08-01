import type { Control, FieldPath, FieldValues } from "react-hook-form";

type Field =
  | "Input"
  | "Textarea"
  | "File Upload"
  | "Checkbox"
  | "Combobox"
  | "Radio Group"
  | "Date Picker"
  | "Time Picker"
  | "Datetime Picker"
  | "Select"
  | "Switch";

interface FieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  className?: string;
}

type Option = {
  label: string;
  value: string;
};

export type { Field, FieldProps, Option };
