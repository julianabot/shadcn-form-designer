import { getFieldDefinition, hasFieldType } from "@/registry";
import type { FieldConfig, FieldType, FieldWithValidation } from "@/types";
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

  return {
    ...field,
    name: crypto.randomUUID(),
    validation: z.string().optional(),
  };
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
