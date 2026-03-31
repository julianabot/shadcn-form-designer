"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z, type ZodTypeAny } from "zod";

import { getFieldDefinition } from "@/registry";
import type {
  FieldWithValidation,
  FormLayout,
  SerializableFieldConfig,
} from "@/types";
import { buildSchema, buildZodSchema } from "@/utils";

import { Button } from "./ui";

type DynamicFormConfig =
  | FieldWithValidation<ZodTypeAny>[]
  | SerializableFieldConfig[]
  | FormLayout;

function isFormLayout(config: DynamicFormConfig): config is FormLayout {
  return (
    !Array.isArray(config) &&
    typeof config === "object" &&
    "fields" in config &&
    "sections" in config
  );
}

function isSerializableConfig(
  config: DynamicFormConfig,
): config is SerializableFieldConfig[] {
  if (!Array.isArray(config) || config.length === 0) return false;
  const first = config[0];
  return (
    "validation" in first &&
    typeof first.validation === "object" &&
    first.validation !== null &&
    "type" in (first.validation as object) &&
    typeof (first.validation as { type: unknown }).type === "string"
  );
}

/** Resolve any config variant into a hydrated field array + optional layout. */
function resolveConfig(config: DynamicFormConfig) {
  if (isFormLayout(config)) {
    const flatConfigs = Object.values(config.fields);
    const hydrated = buildZodSchema(flatConfigs);
    const fieldMap = new Map(hydrated.map((f) => [f.name, f]));

    const sorted: FormLayout = {
      ...config,
      sections: [...config.sections]
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          ...section,
          fields: [...section.fields].sort((a, b) => a.order - b.order),
        })),
    };

    return { hydrated, layout: sorted, fieldMap };
  }

  if (isSerializableConfig(config)) {
    const hydrated = buildZodSchema(config);
    return { hydrated, layout: null, fieldMap: null };
  }

  return {
    hydrated: config as FieldWithValidation<ZodTypeAny>[],
    layout: null,
    fieldMap: null,
  };
}

export interface DynamicFormProps {
  config: DynamicFormConfig;
  /** Called with validated form data on submit. */
  onSubmit?: (data: Record<string, unknown>) => void;
  /** Called with the hydrated field configs on submit (for builder/designer use). */
  onSubmitFieldConfig?: (fields: FieldWithValidation<ZodTypeAny>[]) => void;
  /** Called on every form value change with the current form state. */
  onChange?: (values: Record<string, unknown>) => void;
  /** Called when a field type has no registered definition. Defaults to console.warn. */
  onUnsupportedField?: (type: string, fieldName: string) => void;
}

export function DynamicForm({
  config,
  onSubmit,
  onSubmitFieldConfig,
  onChange,
  onUnsupportedField,
}: DynamicFormProps) {
  const { hydrated, layout, fieldMap } = useMemo(
    () => resolveConfig(config),
    [config],
  );

  const schema = useMemo(() => buildSchema(hydrated), [hydrated]);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        const typeName = value._def?.typeName;
        if (typeName === "ZodBoolean") return [key, false];
        if (typeName === "ZodArray") return [key, []];
        if (typeName === "ZodString") return [key, ""];
        if (typeName === "ZodDate") return [key, undefined];
        // Handle ZodOptional wrapping
        if (typeName === "ZodOptional") {
          const innerTypeName = value._def?.innerType?._def?.typeName;
          if (innerTypeName === "ZodBoolean") return [key, false];
          if (innerTypeName === "ZodArray") return [key, []];
          if (innerTypeName === "ZodString") return [key, ""];
          if (innerTypeName === "ZodDate") return [key, undefined];
        }
        return [key, undefined];
      }),
    ) as FormValues;
  }, [schema]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  // Real-time form state via onChange
  useEffect(() => {
    if (!onChange) return;
    const subscription = watch((values) => {
      onChange(values as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      if (onSubmitFieldConfig) {
        onSubmitFieldConfig(hydrated);
      }
      if (onSubmit) {
        onSubmit(data as Record<string, unknown>);
      }
    },
    [hydrated, onSubmit, onSubmitFieldConfig],
  );

  const renderField = useCallback(
    (field: FieldWithValidation<ZodTypeAny>) => {
      const { type, name, description } = field;
      const error = errors?.[name]?.message as string | undefined;
      const definition = getFieldDefinition(type);

      if (!definition) {
        if (onUnsupportedField) {
          onUnsupportedField(type, name);
        } else {
          console.warn(`Unsupported field type: "${type}" (field: "${name}")`);
        }
        return null;
      }

      const Renderer = definition.renderer;

      return (
        <Renderer
          key={name}
          control={control}
          error={error}
          description={description}
          {...field}
        />
      );
    },
    [control, errors, onUnsupportedField],
  );

  const renderWithLayout = () => {
    if (!layout || !fieldMap) return null;

    return layout.sections.map((section, si) => (
      <div key={si} className="flex flex-col gap-5">
        {section.title && (
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        )}
        {section.fields.map((layoutField) => {
          const field = fieldMap.get(layoutField.fieldName);
          if (!field) return null;
          return renderField(field);
        })}
      </div>
    ));
  };

  const renderFlat = () => hydrated.map(renderField);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {layout ? renderWithLayout() : renderFlat()}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
