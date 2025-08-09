import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import type { HTMLInputTypeAttribute } from "react";
import type { FieldValues } from "react-hook-form";
import type { FieldProps } from "../../types";

interface InputFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  type?: HTMLInputTypeAttribute | undefined;
}

function InputField<TFieldValues extends FieldValues>(
  props: InputFieldProps<TFieldValues>
) {
  const { control, name, label, type, placeholder, description, error } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
              type={type}
              className={clsx(
                type === "time" &&
                  "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              )}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

export { InputField };
