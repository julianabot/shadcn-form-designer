import type { FieldConfig } from "@/types";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

export function buildSchema(config: FieldConfig[]) {
  return z.object(
    config.reduce((acc, field) => {
      acc[field.name] = field.validation;
      return acc;
    }, {} as Record<string, ZodTypeAny>)
  );
}
