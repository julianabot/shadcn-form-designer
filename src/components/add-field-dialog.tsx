import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

function AddFieldDialog() {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", className: "rounded-4xl" })
        )}
      >
        + Add New Field
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {/* Add form here where they can add new field */}
        {/* fields available: input, textarea, select, radio, date, and time */}
        {/*  next fields would get the required fields for the FieldConfig */}
      </DialogContent>
    </Dialog>
  );
}

export { AddFieldDialog };
