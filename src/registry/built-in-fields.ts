import {
  ComboboxField,
  DatePickerField,
  FileUploadField,
  InputField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@/components/fields";
import type { FieldConfig, FieldWithValidation } from "@/types";
import type { ZodTypeAny } from "zod";
import { z } from "zod";
import { registerField } from "./index";

function buildTextValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const { required } = config;
  const name = crypto.randomUUID();
  const baseField = { ...config, name };

  if (config.type !== "input" && config.type !== "textarea") {
    return { ...baseField, name, validation: z.string().optional() };
  }

  const { minLength, maxLength } = config;
  let validation = z.string();

  if (minLength) {
    validation = validation.min(minLength, {
      message: `Must be at least ${minLength} characters`,
    });
  }
  if (maxLength) {
    validation = validation.max(maxLength, {
      message: `Must be at most ${maxLength} characters`,
    });
  }

  return {
    ...baseField,
    validation: required
      ? validation.min(1, { message: "This field is required" })
      : validation.optional(),
  };
}

function buildMultiOptionValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const { required } = config;
  const name = crypto.randomUUID();
  const baseField = { ...config, name };

  if (
    config.type !== "combobox" &&
    config.type !== "radio" &&
    config.type !== "select"
  ) {
    return { ...baseField, validation: z.string().optional() };
  }

  const { options } = config;
  const values = options.map((opt) => opt.value) as [string, ...string[]];

  return {
    ...baseField,
    validation: required ? z.enum(values) : z.enum(values).optional(),
  };
}

function buildBooleanValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const name = crypto.randomUUID();
  return { ...config, name, validation: z.boolean() };
}

function buildDateValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const { required } = config;
  const name = crypto.randomUUID();
  return {
    ...config,
    name,
    validation: required ? z.date() : z.date().optional(),
  };
}

function buildFileValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const name = crypto.randomUUID();
  return {
    ...config,
    name,
    validation: z
      .instanceof(File, { message: "Must be a file" })
      .refine((file) => file.type.startsWith("image/"), {
        message: "File must be an image",
      })
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "Image must be less than 5MB",
      }),
  };
}

export function registerBuiltInFields(): void {
  registerField({
    type: "input",
    label: "Input",
    category: "text",
    renderer: InputField,
    buildValidation: buildTextValidation,
  });

  registerField({
    type: "textarea",
    label: "Textarea",
    category: "text",
    renderer: TextareaField,
    buildValidation: buildTextValidation,
  });

  registerField({
    type: "select",
    label: "Select",
    category: "multi-option",
    renderer: SelectField,
    buildValidation: buildMultiOptionValidation,
  });

  registerField({
    type: "combobox",
    label: "Combobox",
    category: "multi-option",
    renderer: ComboboxField,
    buildValidation: buildMultiOptionValidation,
  });

  registerField({
    type: "radio",
    label: "Radio",
    category: "multi-option",
    renderer: RadioGroupField,
    buildValidation: buildMultiOptionValidation,
  });

  registerField({
    type: "date",
    label: "Date",
    category: "date",
    renderer: DatePickerField,
    buildValidation: buildDateValidation,
  });

  registerField({
    type: "file",
    label: "File",
    category: "file",
    renderer: FileUploadField,
    buildValidation: buildFileValidation,
  });

  registerField({
    type: "switch",
    label: "Switch",
    category: "boolean",
    renderer: SwitchField,
    buildValidation: buildBooleanValidation,
  });
}
