import { cn } from "@/lib/utils";
import { ImageUp } from "lucide-react";
import { FormLabel } from "./form";

interface FileUploadProps extends React.ComponentProps<"input"> {
  previewUrl?: string;
  alt?: string;
  error?: string;
}

function FileUpload({ previewUrl, alt, error, ...props }: FileUploadProps) {
  const ReuploadFile = () => (
    <div className="relative w-full">
      <img
        src={previewUrl}
        alt={alt}
        className="h-50 w-full rounded-md border object-cover"
      />
      <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-md">
        <div className="flex flex-col items-center text-white">
          <ImageUp size={20} />
          <span className="text-sm">Change Image</span>
        </div>
        <input type="file" accept="image/*" className="hidden" {...props} />
      </label>
    </div>
  );

  const UploadFile = () => (
    <label
      className={cn(
        "cursor-pointer border border-dashed rounded-lg px-6 py-4 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2",
        error ? "border-destructive" : "border-gray-300"
      )}
    >
      <div className="flex flex-row gap-1.5 items-center justify-center">
        <ImageUp size={20} className="text-gray-800" />
        <p className="text-gray-800">Upload an Image</p>
      </div>
      <input type="file" accept="image/*" className="hidden" {...props} />
      <p className="text-sm text-gray-500">JPG, PNG — Max size: 5MB</p>
    </label>
  );

  return (
    <div className="flex flex-col gap-2">
      <FormLabel>Header</FormLabel>
      {previewUrl ? <ReuploadFile /> : <UploadFile />}
    </div>
  );
}

export { FileUpload };
