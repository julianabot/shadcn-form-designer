import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
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

    // Sort sections and fields within each section by order
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

export function DynamicForm({
  config,
  onSubmitForm,
  isBuilderMode = false,
}: {
  config: DynamicFormConfig;
  onSubmitForm: (
    data:
      | z.infer<ReturnType<typeof buildSchema>>
      | FieldWithValidation<ZodTypeAny>[],
    isBuilderMode: boolean,
  ) => void;
  isBuilderMode?: boolean;
}) {
  const { hydrated, layout, fieldMap } = useMemo(
    () => resolveConfig(config),
    [config],
  );

  const schema = useMemo(() => buildSchema(hydrated), [hydrated]);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        if (value instanceof z.ZodBoolean) return [key, false];
        if (value instanceof z.ZodArray) return [key, []];
        if (value instanceof z.ZodString) return [key, ""];
        if (value instanceof z.ZodDate) return [key, undefined];
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
  } = form;

  const onSubmit = useCallback(
    (data: FormValues) => {
      onSubmitForm(isBuilderMode ? hydrated : data, isBuilderMode);
    },
    [hydrated, isBuilderMode, onSubmitForm],
  );

  const renderField = useCallback(
    (field: FieldWithValidation<ZodTypeAny>) => {
      const { type, name, description } = field;
      const error = errors?.[name]?.message as string | undefined;
      const definition = getFieldDefinition(type);

      if (!definition) {
        console.warn(`⚠️ Unsupported field type: ${type}`);
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
    [control, errors],
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
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {layout ? renderWithLayout() : renderFlat()}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
