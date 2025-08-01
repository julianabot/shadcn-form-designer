"use client";

import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { FieldProps, Option } from "@/types";
import type { FieldValues } from "react-hook-form";

interface ComboboxFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  options: Option[];
}

function ComboboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  placeholder = "Select an option...",
  className,
  error,
}: ComboboxFieldProps<TFieldValues>) {
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
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ComboboxField };
