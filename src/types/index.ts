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
  | "switch";

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
  type: "switch";
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

/**
 * A version of FieldWithValidation that can be serialized
 * to JSON and stored in a database.
 */

interface StringValidation {
  type: "string";
  min?: number;
  max?: number;
  pattern?: "email" | "url" | "uuid" | "regex";
  regex?: string;
}

interface BooleanValidation {
  type: "boolean";
}

interface EnumValidation {
  type: "enum";
  values: [string, ...string[]];
}

interface DateValidation {
  type: "date";
  min?: string; // ISO date string
  max?: string; // ISO date string
}

interface FileValidation {
  type: "file";
  accept?: string;
  maxSizeMB?: number;
}

type ValidationDescriptor =
  | StringValidation
  | BooleanValidation
  | EnumValidation
  | DateValidation
  | FileValidation;

/**
 * A fully serializable field config that can be saved to a database
 * or sent over the wire as JSON. No Zod instances.
 */
type SerializableFieldConfig = FieldConfig & {
  name: string;
  validation: ValidationDescriptor;
};

export type {
  FieldConfig,
  FieldProps,
  FieldType,
  FieldWithValidation,
  MultipleOptionFieldProps,
  Option,
  SerializableFieldConfig,
  ValidationDescriptor,
};
