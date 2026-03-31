"use client";

import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FieldProps } from "@/types";
import type { Locale } from "date-fns";
import { memo } from "react";
import type { FieldValues } from "react-hook-form";

interface DatePickerFieldProps<
  TFieldValues extends FieldValues,
> extends FieldProps<TFieldValues> {
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
}

function DatePickerFieldInner<TFieldValues extends FieldValues>(
  props: DatePickerFieldProps<TFieldValues>,
) {
  const {
    control,
    name,
    label,
    description,
    placeholder,
    error,
    minDate,
    maxDate,
    locale,
  } = props;

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
          {description && <FormDescription>{description}</FormDescription>}
          {error ? <FormMessage>{error}</FormMessage> : <FormMessage />}
        </FormItem>
      )}
    />
  );
}

const DatePickerField = memo(
  DatePickerFieldInner,
) as typeof DatePickerFieldInner;

export { DatePickerField };
