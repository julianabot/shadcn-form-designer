import {
  DateConfigPanel,
  MultiOptionConfigPanel,
  TextConfigPanel,
} from "@/components/config-panels";
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
import { createElement } from "react";
import type { ZodTypeAny } from "zod";
import { z } from "zod";
import type { AddFieldFormValues } from "./index";
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
  const minDate = config.type === "date" ? config.minDate : undefined;
  const maxDate = config.type === "date" ? config.maxDate : undefined;

  let validation = z.date();

  if (minDate) {
    validation = validation.min(minDate, {
      message: `Date must be after ${minDate.toLocaleDateString()}`,
    });
  }
  if (maxDate) {
    validation = validation.max(maxDate, {
      message: `Date must be before ${maxDate.toLocaleDateString()}`,
    });
  }

  return {
    ...config,
    name,
    validation: required ? validation : validation.optional(),
  };
}

function buildFileValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const name = crypto.randomUUID();
  const accept = config.type === "file" ? config.accept : undefined;
  const maxSizeMB = config.type === "file" ? config.maxSizeMB : undefined;
  const maxBytes = (maxSizeMB ?? 5) * 1024 * 1024;
  const acceptPrefix = accept?.replace("/*", "/") ?? "image/";

  return {
    ...config,
    name,
    validation: z
      .instanceof(File, { message: "Must be a file" })
      .refine((file) => file.type.startsWith(acceptPrefix), {
        message: `File must be of type ${accept ?? "image/*"}`,
      })
      .refine((file) => file.size <= maxBytes, {
        message: `File must be less than ${maxSizeMB ?? 5}MB`,
      }),
  };
}

/** Shared config schema pieces */

const textConfigSchema = {
  minLength: z.string().optional(),
  maxLength: z.string().optional(),
};

const textConfigSuperRefine = (
  data: AddFieldFormValues,
  ctx: z.RefinementCtx,
) => {
  if (!data.minLength || !data.maxLength) {
    ctx.addIssue({
      path: ["minLength"],
      code: z.ZodIssueCode.custom,
      message: "Min and Max are required",
    });
  } else if (Number(data.minLength) >= Number(data.maxLength)) {
    ctx.addIssue({
      path: ["maxLength"],
      code: z.ZodIssueCode.custom,
      message: "Max must be greater than Min",
    });
  }
};

const textConfigDefaults = { minLength: "0", maxLength: "100" };

function buildTextFieldConfig(values: AddFieldFormValues): FieldConfig {
  return {
    type: values.type as "input" | "textarea",
    label: values.label,
    description: values.description,
    required: values.required,
    minLength: values.minLength ? Number(values.minLength) : undefined,
    maxLength: values.maxLength ? Number(values.maxLength) : undefined,
  };
}

const multiOptionConfigSchema = {
  options: z.array(z.string()).optional(),
};

const multiOptionConfigSuperRefine = (
  data: AddFieldFormValues,
  ctx: z.RefinementCtx,
) => {
  const cleaned = data.options?.map((opt) => opt?.trim());
  if (cleaned && cleaned.length < 2) {
    ctx.addIssue({
      path: ["options"],
      code: z.ZodIssueCode.custom,
      message: "At least 2 options are required",
    });
  }
  const isNoDuplicates = cleaned?.length === new Set(cleaned).size;
  if (!isNoDuplicates) {
    ctx.addIssue({
      path: ["options"],
      code: z.ZodIssueCode.custom,
      message: "Options must be unique",
    });
  }
};

const multiOptionConfigDefaults = { options: [""] };

function buildMultiOptionFieldConfig(values: AddFieldFormValues): FieldConfig {
  const options = values.options?.filter(Boolean) ?? [];
  return {
    type: values.type as "combobox" | "radio" | "select",
    label: values.label,
    description: values.description,
    required: values.required,
    options: options.map((label) => ({
      label,
      value: label
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 10),
    })),
  };
}

function buildSimpleFieldConfig(values: AddFieldFormValues): FieldConfig {
  switch (values.type) {
    case "file":
      return {
        type: "file",
        label: values.label,
        description: values.description,
        required: values.required,
      };
    case "switch":
      return {
        type: "switch",
        label: values.label,
        description: values.description,
        required: values.required,
      };
    default:
      return {
        type: "switch",
        label: values.label,
        description: values.description,
        required: values.required,
      };
  }
}

/** Date config */

const dateConfigSchema = {
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
};

const dateConfigSuperRefine = (
  data: AddFieldFormValues,
  ctx: z.RefinementCtx,
) => {
  if (data.minDate && data.maxDate) {
    const min = new Date(data.minDate);
    const max = new Date(data.maxDate);
    if (min >= max) {
      ctx.addIssue({
        path: ["maxDate"],
        code: z.ZodIssueCode.custom,
        message: "Max date must be after min date",
      });
    }
  }
};

const dateConfigDefaults = { minDate: "", maxDate: "" };

function buildDateFieldConfig(values: AddFieldFormValues): FieldConfig {
  return {
    type: "date",
    label: values.label,
    description: values.description,
    required: values.required,
    minDate: values.minDate ? new Date(values.minDate) : undefined,
    maxDate: values.maxDate ? new Date(values.maxDate) : undefined,
  };
}

/** Time field — renders InputField with type="time" */

function buildTimeValidation(
  config: FieldConfig,
): FieldWithValidation<ZodTypeAny> {
  const { required } = config;
  const name = crypto.randomUUID();
  const validation = z.string();

  return {
    ...config,
    name,
    validation: required
      ? validation.min(1, { message: "This field is required" })
      : validation.optional(),
  };
}

// Wrapper that passes type="time" to InputField
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TimeInputField(props: any) {
  return createElement(InputField, { ...props, type: "time" });
}

function buildTimeFieldConfig(values: AddFieldFormValues): FieldConfig {
  return {
    type: "time",
    label: values.label,
    description: values.description,
    required: values.required,
  };
}

export function registerBuiltInFields(): void {
  registerField({
    type: "input",
    label: "Input",
    category: "text",
    renderer: InputField,
    buildValidation: buildTextValidation,
    configSchema: textConfigSchema,
    configSuperRefine: textConfigSuperRefine,
    configDefaults: textConfigDefaults,
    configPanel: TextConfigPanel,
    buildFieldConfig: buildTextFieldConfig,
  });

  registerField({
    type: "textarea",
    label: "Textarea",
    category: "text",
    renderer: TextareaField,
    buildValidation: buildTextValidation,
    configSchema: textConfigSchema,
    configSuperRefine: textConfigSuperRefine,
    configDefaults: textConfigDefaults,
    configPanel: TextConfigPanel,
    buildFieldConfig: buildTextFieldConfig,
  });

  registerField({
    type: "select",
    label: "Select",
    category: "multi-option",
    renderer: SelectField,
    buildValidation: buildMultiOptionValidation,
    configSchema: multiOptionConfigSchema,
    configSuperRefine: multiOptionConfigSuperRefine,
    configDefaults: multiOptionConfigDefaults,
    configPanel: MultiOptionConfigPanel,
    buildFieldConfig: buildMultiOptionFieldConfig,
  });

  registerField({
    type: "combobox",
    label: "Combobox",
    category: "multi-option",
    renderer: ComboboxField,
    buildValidation: buildMultiOptionValidation,
    configSchema: multiOptionConfigSchema,
    configSuperRefine: multiOptionConfigSuperRefine,
    configDefaults: multiOptionConfigDefaults,
    configPanel: MultiOptionConfigPanel,
    buildFieldConfig: buildMultiOptionFieldConfig,
  });

  registerField({
    type: "radio",
    label: "Radio",
    category: "multi-option",
    renderer: RadioGroupField,
    buildValidation: buildMultiOptionValidation,
    configSchema: multiOptionConfigSchema,
    configSuperRefine: multiOptionConfigSuperRefine,
    configDefaults: multiOptionConfigDefaults,
    configPanel: MultiOptionConfigPanel,
    buildFieldConfig: buildMultiOptionFieldConfig,
  });

  registerField({
    type: "date",
    label: "Date",
    category: "date",
    renderer: DatePickerField,
    buildValidation: buildDateValidation,
    configSchema: dateConfigSchema,
    configSuperRefine: dateConfigSuperRefine,
    configDefaults: dateConfigDefaults,
    configPanel: DateConfigPanel,
    buildFieldConfig: buildDateFieldConfig,
  });

  registerField({
    type: "file",
    label: "File",
    category: "file",
    renderer: FileUploadField,
    buildValidation: buildFileValidation,
    buildFieldConfig: buildSimpleFieldConfig,
  });

  registerField({
    type: "switch",
    label: "Switch",
    category: "boolean",
    renderer: SwitchField,
    buildValidation: buildBooleanValidation,
    buildFieldConfig: buildSimpleFieldConfig,
  });

  registerField({
    type: "time",
    label: "Time",
    category: "text",
    renderer: TimeInputField,
    buildValidation: buildTimeValidation,
    buildFieldConfig: buildTimeFieldConfig,
  });
}
