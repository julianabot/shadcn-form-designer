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

const FieldTypeEnum = {
  Input: "input",
  Textarea: "textarea",
  File: "file",
  Combobox: "combobox",
  Radio: "radio",
  Date: "date",
  Select: "select",
  Switch: "switch",
} as const;

type FieldType = (typeof FieldTypeEnum)[keyof typeof FieldTypeEnum];

type BaseField<T extends ZodTypeAny> = CommonFieldMeta & {
  type: FieldType;
  // TODO: Remove this field, since we will have a different processing for this
  validation?: T;
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

export { FieldTypeEnum };

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
