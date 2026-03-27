import { MultiOptionInputField } from "@/components/fields";
import type { ConfigPanelProps } from "@/registry";

function MultiOptionConfigPanel({ form }: ConfigPanelProps) {
  const {
    control,
    formState: { errors },
    watch,
    register,
    setValue,
  } = form;

  const options = watch("options");

  return (
    <MultiOptionInputField
      control={control}
      name="options"
      label="Options"
      options={
        options ? options.map((s: string) => ({ label: s, value: s })) : []
      }
      error={errors.options?.root?.message as string | undefined}
      register={register}
      setValue={setValue}
    />
  );
}

export { MultiOptionConfigPanel };
