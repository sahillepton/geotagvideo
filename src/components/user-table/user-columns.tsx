"use client";

import { ColumnDef } from "@tanstack/react-table";
import TextTruncate from "../columns/text-truncate";
import { UserActionMenu } from "./user-action-menu";
import { ManagerCell } from "./manager-cell";

interface CreateColumnsParams {
  currentUser: any;
  data: any;
}

export function createUserColumns({
  currentUser,
  data,
}: CreateColumnsParams): ColumnDef<any>[] {
  return [
    ...(currentUser.role?.toLowerCase() === "admin" ||
    currentUser.role?.toLowerCase() === "manager"
      ? [
          {
            accessorKey: "action",
            header: "",
            cell: ({ row }: { row: any }) => {
              return (
                <UserActionMenu
                  user={row.original}
                  currentUser={currentUser}
                  data={data}
                />
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <TextTruncate text={row.original.username} />,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <TextTruncate text={row.original.email} />,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <TextTruncate text={row.original.role} />,
    },
    {
      accessorKey: "manager",
      header: "Manager",
      cell: ({ row }) => (
        <ManagerCell
          managerId={row.original.manager_id}
          allUsers={data?.allUsers || []}
        />
      ),
    },
  ];
}
