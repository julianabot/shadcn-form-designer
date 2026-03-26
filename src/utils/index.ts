import { getFieldDefinition, hasFieldType } from "@/registry";
import type {
  FieldConfig,
  FieldType,
  FieldWithValidation,
  SerializableFieldConfig,
  ValidationDescriptor,
} from "@/types";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

function buildSchema(config: FieldWithValidation<ZodTypeAny>[]) {
  return z.object(
    config.reduce(
      (acc, field) => {
        const { validation, name } = field;
        acc[name] = validation;
        return acc;
      },
      {} as Record<string, ZodTypeAny>,
    ),
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
  return hasFieldType(type);
}

function buildValidation(field: FieldConfig): FieldWithValidation<ZodTypeAny> {
  const definition = getFieldDefinition(field.type);

  if (definition) {
    return definition.buildValidation(field);
  }

  const name = crypto.randomUUID();
  return {
    ...field,
    name,
    validation: z.string().optional(),
  };
}

/**
 * Converts an array of SerializableFieldConfig (with pure JSON validation descriptors)
 * into FieldWithValidation[] with live Zod schemas, ready for DynamicForm.
 */
function hydrateValidation(
  descriptor: ValidationDescriptor,
  required?: boolean,
): ZodTypeAny {
  switch (descriptor.type) {
    case "string": {
      let schema = z.string();
      if (descriptor.min != null) {
        schema = schema.min(descriptor.min, {
          message: `Must be at least ${descriptor.min} characters`,
        });
      }
      if (descriptor.max != null) {
        schema = schema.max(descriptor.max, {
          message: `Must be at most ${descriptor.max} characters`,
        });
      }
      if (descriptor.pattern === "email") {
        schema = schema.email({ message: "Invalid email address" });
      } else if (descriptor.pattern === "url") {
        schema = schema.url({ message: "Invalid URL" });
      } else if (descriptor.pattern === "uuid") {
        schema = schema.uuid({ message: "Invalid UUID" });
      } else if (descriptor.pattern === "regex" && descriptor.regex) {
        schema = schema.regex(new RegExp(descriptor.regex), {
          message: "Invalid format",
        });
      }
      return required
        ? schema.min(1, { message: "This field is required" })
        : schema.optional();
    }
    case "boolean":
      return z.boolean();
    case "enum":
      return required
        ? z.enum(descriptor.values)
        : z.enum(descriptor.values).optional();
    case "date": {
      let schema = z.date();
      if (descriptor.min) {
        const minDate = new Date(descriptor.min);
        schema = schema.min(minDate, {
          message: `Date must be after ${minDate.toLocaleDateString()}`,
        });
      }
      if (descriptor.max) {
        const maxDate = new Date(descriptor.max);
        schema = schema.max(maxDate, {
          message: `Date must be before ${maxDate.toLocaleDateString()}`,
        });
      }
      return required ? schema : schema.optional();
    }
    case "file": {
      const maxBytes = (descriptor.maxSizeMB ?? 5) * 1024 * 1024;
      const acceptPrefix = descriptor.accept?.replace("/*", "/") ?? "image/";
      return z
        .instanceof(File, { message: "Must be a file" })
        .refine((file) => file.type.startsWith(acceptPrefix), {
          message: `File must be of type ${descriptor.accept ?? "image/*"}`,
        })
        .refine((file) => file.size <= maxBytes, {
          message: `File must be less than ${descriptor.maxSizeMB ?? 5}MB`,
        });
    }
    default:
      return z.string().optional();
  }
}

/**
 * Hydrates an array of serializable JSON field configs into
 * FieldWithValidation[] with live Zod schemas, ready for DynamicForm.
 */
function buildZodSchema(
  configs: SerializableFieldConfig[],
): FieldWithValidation<ZodTypeAny>[] {
  return configs.map((config) => {
    const { validation: descriptor, ...rest } = config;
    return {
      ...rest,
      validation: hydrateValidation(descriptor, rest.required),
    };
  });
}

/**
 * Converts a FieldConfig (from the add-field dialog) into a
 * SerializableFieldConfig with a pure-JSON validation descriptor.
 */
function toSerializableField(
  field: FieldConfig,
  name?: string,
): SerializableFieldConfig {
  const fieldName = name ?? crypto.randomUUID();
  const base = { ...field, name: fieldName };

  switch (field.type) {
    case "input":
    case "textarea":
      return {
        ...base,
        validation: {
          type: "string",
          min: field.minLength,
          max: field.maxLength,
        },
      };
    case "combobox":
    case "radio":
    case "select":
      return {
        ...base,
        validation: {
          type: "enum",
          values: field.options.map((o) => o.value) as [string, ...string[]],
        },
      };
    case "switch":
      return {
        ...base,
        validation: { type: "boolean" },
      };
    case "date":
      return {
        ...base,
        validation: {
          type: "date",
          min: field.minDate?.toISOString(),
          max: field.maxDate?.toISOString(),
        },
      };
    case "file":
      return {
        ...base,
        validation: {
          type: "file",
          accept: field.accept,
          maxSizeMB: field.maxSizeMB,
        },
      };
    default:
      return { ...base, validation: { type: "string" } };
  }
}

export {
  buildSchema,
  buildValidation,
  buildZodSchema,
  hydrateValidation,
  isDateFieldType,
  isFieldType,
  isFileFieldType,
  isInputFieldType,
  isMultipleOptionFieldType,
  toSerializableField,
};
