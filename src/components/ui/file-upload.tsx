import { ImageUp } from "lucide-react";

function FileUpload({ ...props }: React.ComponentProps<"input">) {
  return (
    <label className="cursor-pointer border border-dashed border-gray-300 rounded-lg px-6 py-4 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2">
      <div className="flex flex-row gap-1.5 items-center justify-center">
        <ImageUp size={20} className="text-gray-800" />
        <p className="text-gray-800">Upload an Image</p>
      </div>
      <input type="file" accept="image/*" className="hidden" {...props} />
      <p className="text-sm text-gray-500">JPG, PNG — Max size: 5MB</p>
    </label>
  );
}

export { FileUpload };
