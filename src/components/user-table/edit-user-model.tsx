import { useActionState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { editUser } from "./action";
import { Loader2, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const EditUserModel = ({
  currentUser,
  data,
  user,
}: {
  currentUser: any;
  data: any;
  user: any;
}) => {
  // console.log(user, "user edit");
  // console.log(currentUser, data, user, "edit user");
  const [state, formAction, isPending] = useActionState(editUser, null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (state?.message && state?.success) {
      toast.success(state.message);
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
    }
  }, [state?.message, queryClient]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <PencilIcon size={16} className="text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-lg shadow-lg p-6 bg-white dark:bg-[#11181c]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form action={formAction}>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {/* Hidden User ID */}
            <input type="hidden" name="userId" value={user?.user_id ?? ""} />

            {/* Username */}
            <div className="flex flex-col">
              <Label
                htmlFor="edit-username"
                className="mb-1 text-gray-700 font-medium dark:text-white"
              >
                Username
              </Label>
              <Input
                id="edit-username"
                name="username"
                defaultValue={user?.username}
                placeholder="Enter username"
                className="border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              {state?.errors?.username && (
                <p className="text-red-500 text-sm">{state.errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <Label
                htmlFor="edit-email"
                className="mb-1 text-gray-700 font-medium dark:text-white"
              >
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                name="email"
                defaultValue={user?.email}
                placeholder="Enter email"
                className="border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              {state?.errors?.email && (
                <p className="text-red-500 text-sm">{state.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <Label
                htmlFor="edit-password"
                className="mb-1 text-gray-700 font-medium dark:text-white"
              >
                Password{" "}
                <span className="text-sm text-gray-500">
                  (leave blank to keep current)
                </span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                name="password"
                placeholder="Enter new password"
                className="border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              {state?.errors?.password && (
                <p className="text-red-500 text-sm">{state.errors.password}</p>
              )}
            </div>
            {/* Role & Manager */}
            {currentUser.role?.toLowerCase() === "admin" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="edit-role"
                    className="mb-1 text-gray-700 font-medium dark:text-white"
                  >
                    Role
                  </Label>
                  <Select name="role" defaultValue={user?.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="surveyor">Surveyor</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.errors?.role && (
                    <p className="text-red-500 text-sm">{state.errors.role}</p>
                  )}
                </div>

                {/* Manager */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="edit-manager"
                    className="mb-1 text-gray-700 font-medium dark:text-white"
                  >
                    Manager
                  </Label>
                  <Select
                    name="manager_id"
                    defaultValue={user?.manager_id ?? "no-manager"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-manager">No Manager</SelectItem>
                      {data?.allUsers
                        ?.filter(
                          (u: any) =>
                            (u.role === "manager" || u.role === "admin") &&
                            u.user_id !== user?.user_id
                        )
                        .map((u: any) => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.username}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.manager_id && (
                    <p className="text-red-500 text-sm">
                      {state.errors.manager_id}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex flex-col">
              <Label
                htmlFor="edit-location"
                className="mb-1 text-gray-700 font-medium dark:text-white"
              >
                Location
              </Label>
              <Input
                id="edit-location"
                name="location"
                defaultValue={user?.location}
                placeholder="Enter location"
                className="border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              {state?.errors?.location && (
                <p className="text-red-500 text-sm">{state.errors.location}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModel;
