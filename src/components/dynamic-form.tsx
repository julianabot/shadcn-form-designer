import { zodResolver } from "@hookform/resolvers/zod";
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

// TODO: Fix rendering of component types
export function DynamicForm({
  config,
}: {
  config: FieldWithValidation<ZodTypeAny>[];
}) {
  const schema = buildSchema(config);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {} as FormValues,
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitted:", data);
  };

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {config.map((field) => {
          const { type, name, description } = field;
          const errorMessage = errors?.[field.name]?.message as
            | string
            | undefined;
          if (type === "input") {
            return (
              <InputField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "date") {
            return (
              <DatePickerField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "file") {
            return (
              <FileUploadField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "radio") {
            return (
              <RadioGroupField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "select") {
            return (
              <SelectField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "switch") {
            return (
              <SwitchField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "textarea") {
            return (
              <TextareaField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }

          if (type === "combobox") {
            return (
              <ComboboxField
                control={control}
                key={name}
                error={errorMessage}
                description={description}
                {...field}
              />
            );
          }
        })}
        <Button>Submit</Button>
      </form>
    </FormProvider>
  );
}
