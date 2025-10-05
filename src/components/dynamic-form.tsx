import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z, type ZodTypeAny } from "zod";

import type { FieldWithValidation } from "../types";
import { buildSchema } from "../utils";

import {
  ComboboxField,
  DatePickerField,
  FileUploadField,
  InputField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "./fields";
import { Button } from "./ui";

export function DynamicForm({
  config,
  onSubmitForm,
  isBuilderMode = false,
}: {
  config: FieldWithValidation<ZodTypeAny>[];
  onSubmitForm: (
    data:
      | z.infer<ReturnType<typeof buildSchema>>
      | FieldWithValidation<ZodTypeAny>[],
    isBuilderMode: boolean
  ) => void;
  isBuilderMode?: boolean;
}) {
  const schema = useMemo(() => buildSchema(config), [config]);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        if (value instanceof z.ZodBoolean) return [key, false];
        if (value instanceof z.ZodArray) return [key, []];
        if (value instanceof z.ZodString) return [key, ""];
        if (value instanceof z.ZodDate) return [key, undefined];
        return [key, undefined];
      })
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
      onSubmitForm(isBuilderMode ? config : data, isBuilderMode);
    },
    [config, isBuilderMode, onSubmitForm]
  );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {config.map((field) => {
          const { type, name, description } = field;
          const error = errors?.[name]?.message as string | undefined;

          switch (type) {
            case "input":
              return (
                <InputField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "textarea":
              return (
                <TextareaField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "select":
              return (
                <SelectField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "radio":
              return (
                <RadioGroupField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "date":
              return (
                <DatePickerField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "file":
              return (
                <FileUploadField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "switch":
              return (
                <SwitchField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            case "combobox":
              return (
                <ComboboxField
                  key={name}
                  control={control}
                  error={error}
                  description={description}
                  {...field}
                />
              );

            default:
              console.warn(`⚠️ Unsupported field type: ${type}`);
              return null;
          }
        })}

        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
