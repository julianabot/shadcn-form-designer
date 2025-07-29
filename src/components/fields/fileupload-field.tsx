import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FieldProps } from "@/types";
import type { FieldValues } from "react-hook-form";

function FileUploadField<TFieldValues extends FieldValues>(
  props: FieldProps<TFieldValues>
) {
  const { control, name, label, description, error } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <FileUpload {...field} />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  );
}

export { FileUploadField };
