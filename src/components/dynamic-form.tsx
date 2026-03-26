import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z, type ZodTypeAny } from "zod";

import { getFieldDefinition } from "@/registry";
import type { FieldWithValidation, SerializableFieldConfig } from "@/types";
import { buildSchema, buildZodSchema } from "@/utils";

import { Button } from "./ui";

type DynamicFormConfig =
  | FieldWithValidation<ZodTypeAny>[]
  | SerializableFieldConfig[];

function isSerializableConfig(
  config: DynamicFormConfig,
): config is SerializableFieldConfig[] {
  if (config.length === 0) return false;
  const first = config[0];
  return (
    "validation" in first &&
    typeof first.validation === "object" &&
    first.validation !== null &&
    "type" in (first.validation as object) &&
    typeof (first.validation as { type: unknown }).type === "string"
  );
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
  const hydratedConfig = useMemo<FieldWithValidation<ZodTypeAny>[]>(() => {
    if (isSerializableConfig(config)) {
      return buildZodSchema(config);
    }
    return config as FieldWithValidation<ZodTypeAny>[];
  }, [config]);

  const schema = useMemo(() => buildSchema(hydratedConfig), [hydratedConfig]);
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
      onSubmitForm(isBuilderMode ? hydratedConfig : data, isBuilderMode);
    },
    [hydratedConfig, isBuilderMode, onSubmitForm],
  );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {hydratedConfig.map((field) => {
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
        })}

        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
