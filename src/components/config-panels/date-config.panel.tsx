"use client";

import { InputField } from "@/components/fields";
import type { ConfigPanelProps } from "@/registry";

function DateConfigPanel({ form }: ConfigPanelProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-row gap-2 items-start">
      <InputField
        control={control}
        name="minDate"
        label="Min Date"
        type="date"
        error={errors.minDate?.message as string | undefined}
      />
      <InputField
        control={control}
        name="maxDate"
        label="Max Date"
        type="date"
        error={errors.maxDate?.message as string | undefined}
      />
    </div>
  );
}

export { DateConfigPanel };
