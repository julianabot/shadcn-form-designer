import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { FieldProps } from "@/types";
import type { FieldValues } from "react-hook-form";

function FileUploadField<TFieldValues extends FieldValues>(
  props: FieldProps<TFieldValues>
) {
  const { control, name, error } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <FileUpload {...field} />
          </FormControl>
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  );
}

export { FileUploadField };
