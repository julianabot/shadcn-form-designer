"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FieldValues } from "react-hook-form";
import type { FieldProps, Option } from "../../types";

interface RadioGroupFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  options: Option[];
}

export function RadioGroupField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
}: RadioGroupFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col"
            >
              {options.map((opt) => (
                <FormItem key={opt.value} className="flex items-center gap-3">
                  <FormControl>
                    <RadioGroupItem value={opt.value} id={opt.value} />
                  </FormControl>
                  <Label htmlFor={opt.value} className="font-normal">
                    {opt.label}
                  </Label>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
