"use client";

import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { FieldValues } from "react-hook-form";
import type { FieldProps, Option } from "../../types";

interface ComboboxFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  options: Option[];
}

function ComboboxField<TFieldValues extends FieldValues>(
  props: ComboboxFieldProps<TFieldValues>
) {
  const {
    control,
    name,
    label,
    description,
    options,
    placeholder = "Select an option...",
    className,
    error,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              className={cn(
                `justify-between ${error && "border-destructive"}`,
                className
              )}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

export { ComboboxField };
