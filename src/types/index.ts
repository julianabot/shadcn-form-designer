import type { Control, FieldPath, FieldValues, Message } from "react-hook-form";
import type { ZodTypeAny } from "zod";

type CommonFieldMeta = {
  label: string;
  description?: string;
};

type FieldProps<TFieldValues extends FieldValues> = CommonFieldMeta & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  placeholder?: string;
  error?: string | Message;
  className?: string;
};

type Option = {
  label: string;
  value: string;
};

type FieldType =
  | "input"
  | "textarea"
  | "file"
  | "combobox"
  | "radio"
  | "date"
  | "select"
  | "switch"
  | "checkbox";

type BaseField = CommonFieldMeta & {
  type: FieldType;
  required?: boolean;
};

type TextField = BaseField & {
  type: "input" | "textarea";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
};

type BooleanField = BaseField & {
  type: "checkbox" | "switch";
};

type MultipleOptionField = BaseField & {
  type: "radio" | "select" | "combobox";
  options: Option[];
};

type DateField = BaseField & {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
};

type FileField = BaseField & {
  type: "file";
  accept?: string;
  maxSizeMB?: number;
};

type FieldConfig =
  | TextField
  | BooleanField
  | MultipleOptionField
  | DateField
  | FileField;

type FieldWithValidation<T extends ZodTypeAny> = FieldConfig & {
  name: string;
  validation: T;
};

export type {
  BaseField,
  BooleanField,
  DateField,
  FieldConfig,
  FieldProps,
  FieldType,
  FieldWithValidation,
  FileField,
  MultipleOptionField,
  Option,
  TextField,
};
