"use client";

import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Locale } from "date-fns";
import type { FieldValues } from "react-hook-form";
import type { FieldProps } from "../../types";

interface DatePickerFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
}

export function DatePickerField<TFieldValues extends FieldValues>(
  props: DatePickerFieldProps<TFieldValues>
) {
  const { control, name, label, placeholder, minDate, maxDate, locale } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              minDate={minDate}
              maxDate={maxDate}
              locale={locale}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
