import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { deleteUser } from "./action";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, TrashIcon } from "lucide-react";

const DeleteUserModal = ({ deletingUser }: { deletingUser: any }) => {
  const queryClient = useQueryClient();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="group w-full justify-between px-3 py-2 rounded-lg transition-all 
                       hover:bg-accent hover:text-accent-foreground"
        >
          <span className="flex items-center">
            <TrashIcon className="w-4 h-4 mr-2 transition-colors group-hover:text-accent-foreground" />
            Delete User
          </span>
          <ArrowRightIcon className="w-4 h-4 opacity-70 transition-all group-hover:translate-x-1 group-hover:text-accent-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:bg-[#11181c]">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-white">
            Delete User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-white">
            Are you sure you want to delete user{" "}
            <strong>{deletingUser?.username}</strong>? This action cannot be
            undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const { error } = await deleteUser(deletingUser.user_id);
              if (error) {
                toast.error(error);
              } else {
                toast.success("User deleted successfully");
                queryClient.invalidateQueries({
                  queryKey: ["users-management"],
                });
              }
            }}
          >
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserModal;
