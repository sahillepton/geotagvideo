import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface ErrorDialogProps {
  filename: string;
  error: string;
}

const ErrorDialog = ({ filename, error }: ErrorDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
          <XIcon size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Error</DialogTitle>
          <DialogDescription>
            An error occurred while processing <strong>{filename}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;

