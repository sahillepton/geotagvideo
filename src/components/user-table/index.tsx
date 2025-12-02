"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../table/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TablePagination } from "../table/pagination";
import { UserSearchBar } from "./user-search-bar";
import { RoleFilterPopover } from "./role-filter-popover";
import { useUserFilters } from "./use-user-filters";
import { createUserColumns } from "./user-columns";
import AddUserModal from "./add-user-modal";

export default function UserTable({ currentUser }: { currentUser: any }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Fetch all users data
  const { data, isLoading } = useQuery({
    queryKey: ["users-management"],
    queryFn: async () => {
      const userRole = currentUser.role?.toLowerCase();
      if (userRole === "admin") {
        const { data: allUserData, error: allUserError } = await supabase
          .from("users")
          .select("*");

        if (allUserError) throw allUserError;

        return {
          users: allUserData || [],
          allUsers: allUserData || [],
        };
      }

      let userQuery = supabase.from("users").select("*");

      if (userRole === "manager" && currentUser.user_id) {
        userQuery = userQuery.or(
          `manager_id.eq.${currentUser.user_id},user_id.eq.${currentUser.user_id}`
        );

        const { data: userData, error } = await userQuery;

        if (error) throw error;

        const { data: allUserData } = await supabase
          .from("users")
          .select("user_id,username,role");

        return {
          users: userData || [],
          allUsers: allUserData || [],
        };
      }
    },
  });

  // Use filtering and pagination hook
  const { paginatedUsers, totalPages } = useUserFilters({
    users: data?.users || [],
    search,
    selectedRole,
    page,
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedRole]);

  // Get unique roles from the data
  const roles = useMemo(() => {
    if (!data?.users) return [];
    return [...new Set(data.users.map((user) => user.role).filter(Boolean))];
  }, [data?.users]);

  // Create columns
  const columns = createUserColumns({
    currentUser,
    data,
  });

  const handleClearFilters = () => {
    setSelectedRole("");
    setSearch("");
    setPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className="container py-6 max-w-[1050px] mx-auto">
      <div className="mb-4 w-full flex justify-between">
        <UserSearchBar
          search={search}
          onSearchChange={setSearch}
          onClearFilters={handleClearFilters}
          hasActiveFilters={!!(selectedRole || search)}
        />

        <div className="flex items-center gap-2 h-8">
          <RoleFilterPopover
            selectedRole={selectedRole}
            roles={roles}
            onRoleChange={handleRoleChange}
          />
          {currentUser.role?.toLowerCase() !== "surveyor" && (
            <AddUserModal currentUser={currentUser} data={data} />
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={paginatedUsers}
        isFetching={isLoading}
      />
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
