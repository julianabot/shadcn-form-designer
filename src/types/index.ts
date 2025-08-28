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

type MultipleOptionFieldProps<TFieldValues extends FieldValues> =
  FieldProps<TFieldValues> & {
    options: Option[];
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

interface BaseField extends CommonFieldMeta {
  type: FieldType;
  required?: boolean;
}

interface TextField extends BaseField {
  type: "input" | "textarea";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

interface BooleanField extends BaseField {
  type: "checkbox" | "switch";
}

interface MultipleOptionField extends BaseField {
  type: "radio" | "select" | "combobox";
  options: Option[];
}

interface DateField extends BaseField {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
}

interface FileField extends BaseField {
  type: "file";
  accept?: string;
  maxSizeMB?: number;
}

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
  MultipleOptionFieldProps,
  Option,
  TextField,
};
