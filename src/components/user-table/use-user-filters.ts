import { useMemo } from "react";

interface UseUserFiltersParams {
  users: any[];
  search: string;
  selectedRole: string;
  page: number;
  pageSize?: number;
}

export function useUserFilters({
  users,
  search,
  selectedRole,
  page,
  pageSize = 10,
}: UseUserFiltersParams) {
  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = [...users];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    return filtered;
  }, [users, search, selectedRole]);

  // Apply pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, page, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  return {
    filteredUsers,
    paginatedUsers,
    totalPages,
  };
}
