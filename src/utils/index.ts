import type { FieldConfig, FieldType, FieldWithValidation } from "@/types";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

function buildSchema(config: FieldWithValidation<ZodTypeAny>[]) {
  return z.object(
    config.reduce((acc, field) => {
      const { validation, name } = field;
      acc[name] = validation;
      return acc;
    }, {} as Record<string, ZodTypeAny>)
  );
}

function isInputFieldType(type: string) {
  return type === "input" || type === "textarea";
}

function isMultipleOptionFieldType(type: string) {
  return type === "combobox" || type === "radio" || type === "select";
}

function isDateFieldType(type: string) {
  return type === "date";
}

function isFileFieldType(type: string) {
  return type === "file";
}

function isFieldType(type: string): type is FieldType {
  return (
    isInputFieldType(type) ||
    isMultipleOptionFieldType(type) ||
    isDateFieldType(type) ||
    isFileFieldType(type)
  );
}

function buildValidation(field: FieldConfig): FieldWithValidation<ZodTypeAny> {
  const { type, required, label } = field;
  const name = toCamelCase(label);
  const baseField = {
    ...field,
    name,
  };

  if (type === "input" || type === "textarea") {
    const { minLength, maxLength } = field;
    let validation = z.string();
    if (required) {
      validation = validation.min(1, "This field is required.");
    }

    if (minLength) {
      validation = validation.min(minLength, {
        message: `Must be at least ${minLength} characters`,
      });
    }

    if (maxLength) {
      validation = validation.min(maxLength, {
        message: `Must be at least ${maxLength} characters`,
      });
    }

    return {
      ...baseField,
      validation,
    };
  }

  if (type === "switch" || type === "checkbox") {
    return {
      ...baseField,
      validation: z.boolean(),
    };
  }

  if (type === "combobox" || type === "radio" || type === "select") {
    const { options } = field;
    return {
      ...baseField,
      validation: required
        ? z.enum(options.map((opt) => opt.value) as [string, ...string[]])
        : z
            .enum(options.map((opt) => opt.value) as [string, ...string[]])
            .optional(),
    };
  }

  if (type === "date") {
    return {
      ...baseField,
      validation: field.required ? z.date() : z.date().optional(),
    };
  }

  if (type === "file") {
    return {
      ...baseField,
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

  return {
    ...baseField,
    validation: z.string().optional(),
  };
}

function toCamelCase(label: string): string {
  return label
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}
export {
  buildSchema,
  isDateFieldType,
  isFieldType,
  isFileFieldType,
  isInputFieldType,
  isMultipleOptionFieldType,
};
