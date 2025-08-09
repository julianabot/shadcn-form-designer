import type { Control, FieldPath, FieldValues, Message } from "react-hook-form";
import type { z, ZodTypeAny } from "zod";

type CommonFieldMeta = {
  name: string;
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
  | "switch";

type BaseField<T extends ZodTypeAny> = CommonFieldMeta & {
  type: FieldType;
  validation: T;
};

type TextField = BaseField<z.ZodString> & {
  type: "input" | "textarea";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
};

type BooleanField = BaseField<z.ZodBoolean> & {
  type: "checkbox" | "switch";
};

type SingleChoiceField<Opt extends string = string> = BaseField<
  z.ZodEnum<[Opt, ...Opt[]]>
> & {
  type: "radio" | "select" | "combobox";
  options: Option[];
};

type DateField = BaseField<z.ZodDate> & {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
};

type FileField = BaseField<z.ZodType<File>> & {
  type: "file";
  accept?: string;
  maxSizeMB?: number;
};

type FieldConfig =
  | TextField
  | BooleanField
  | SingleChoiceField
  | DateField
  | FileField;

export type {
  BaseField,
  BooleanField,
  DateField,
  FieldConfig,
  FieldProps,
  FieldType,
  FileField,
  Option,
  SingleChoiceField,
  TextField,
};
