import { EyeIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useMemo } from "react";

const TrackPreview = ({ content }: { content: Blob }) => {
  const text = useMemo(async () => {
    return await content.text();
  }, [content]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs">
          <EyeIcon size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Preview</DialogTitle>
        </DialogHeader>
        <code className="text-xs font-mono bg-muted p-2 rounded-md text-[#717370] overflow-auto max-h-[300px]">
          {text}
        </code>
      </DialogContent>
    </Dialog>
  );
};

export default TrackPreview;
