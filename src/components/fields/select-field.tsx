import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldValues } from "react-hook-form";
import type { FieldProps, Option } from "../../types";

interface SelectFieldProps<TFieldValues extends FieldValues>
  extends FieldProps<TFieldValues> {
  options: Option[];
}

function SelectField<TFieldValues extends FieldValues>(
  props: SelectFieldProps<TFieldValues>
) {
  const {
    control,
    name,
    label,
    description,
    options,
    placeholder = "Select an option...",
    error,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

export { SelectField };
