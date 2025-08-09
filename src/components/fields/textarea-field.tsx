import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FieldValues } from "react-hook-form";
import type { FieldProps } from "../../types";

function TextareaField<TFieldValues extends FieldValues>(
  props: FieldProps<TFieldValues>
) {
  const { control, name, label, placeholder, description, error } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
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

export { TextareaField };
