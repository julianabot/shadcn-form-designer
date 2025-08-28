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
  const { type, required } = field;
  const name = generateGUID();
  const baseField = {
    ...field,
    name,
  };

  if (type === "input" || type === "textarea") {
    const { minLength, maxLength } = field;
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

function generateGUID(): string {
  const timestamp = Date.now().toString(16);
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return (
    timestamp.padStart(12, "0").slice(-12).slice(0, 8) +
    "-" +
    random.slice(0, 4) +
    "-" +
    random.slice(4, 8) +
    "-" +
    random.slice(8, 12) +
    "-" +
    random.slice(12, 16) +
    timestamp.padEnd(12, "0").slice(0, 8)
  );
}

export {
  buildSchema,
  buildValidation,
  isDateFieldType,
  isFieldType,
  isFileFieldType,
  isInputFieldType,
  isMultipleOptionFieldType,
};
