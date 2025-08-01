import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FieldProps } from "@/types";
import type { FieldValues } from "react-hook-form";
import { Checkbox } from "../ui";

function CheckboxField<TFieldValues extends FieldValues>(
  props: FieldProps<TFieldValues>
) {
  const { control, name, label, description, error } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormLabel
              htmlFor={name}
              className={`${
                error && "has-[[aria-checked=true]]:destructive"
              } hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-gray-600 has-[[aria-checked=true]]:bg-gray-50 dark:has-[[aria-checked=true]]:border-gray-900 dark:has-[[aria-checked=true]]:bg-gray-950`}
            >
              <Checkbox
                {...field}
                id={name}
                defaultChecked
                className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:border-gray-700 dark:data-[state=checked]:bg-gray-700"
              />
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">{label}</p>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            </FormLabel>
          </FormControl>
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  );
}

export { CheckboxField };
