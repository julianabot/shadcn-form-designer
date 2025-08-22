import type { FieldConfig } from "@/types";
import { FieldTypeEnum } from "@/types";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

function buildSchema(config: FieldConfig[]) {
  return z.object(
    config.reduce((acc, field) => {
      const { validation, name } = field;
      if (validation) acc[name] = validation;
      return acc;
    }, {} as Record<string, ZodTypeAny>)
  );
}
function isInputFieldType(type: string) {
  return type === FieldTypeEnum.Input || type === FieldTypeEnum.Textarea;
}

function isMultipleOptionFieldType(type: string) {
  return (
    type === FieldTypeEnum.Combobox ||
    type === FieldTypeEnum.Radio ||
    type == FieldTypeEnum.Select
  );
}

function isDateFieldType(type: string) {
  return type === FieldTypeEnum.Date;
}

function isFileFieldType(type: string) {
  return type === FieldTypeEnum.File;
}

export {
  buildSchema,
  isDateFieldType,
  isFileFieldType,
  isInputFieldType,
  isMultipleOptionFieldType,
};
