import { InputField } from "@/components/fields";
import type { ConfigPanelProps } from "@/registry";

function TextConfigPanel({ form }: ConfigPanelProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-row gap-2 items-start">
      <InputField
        control={control}
        name="minLength"
        label="Min"
        error={errors.minLength?.message as string | undefined}
      />
      <InputField
        control={control}
        name="maxLength"
        label="Max"
        error={errors.maxLength?.message as string | undefined}
      />
    </div>
  );
}

export { TextConfigPanel };
