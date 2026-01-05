"use client";

import { Avatar, AvatarFallback } from "../ui/avatar";

// Define some color pairs for avatars
const avatarColors = [
  { bg: "bg-green-200", text: "text-green-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-red-200", text: "text-red-800" },
  { bg: "bg-yellow-200", text: "text-yellow-800" },
  { bg: "bg-purple-200", text: "text-purple-800" },
  { bg: "bg-pink-200", text: "text-pink-800" },
  { bg: "bg-indigo-200", text: "text-indigo-800" },
];

const getRandomAvatarColor = () => {
  const randomIndex = Math.floor(Math.random() * avatarColors.length);
  return avatarColors[randomIndex];
};

interface ManagerCellProps {
  managerId: string | null;
  allUsers: any[];
}

export function ManagerCell({ managerId, allUsers }: ManagerCellProps) {
  const manager = allUsers?.find((user: any) => user.user_id === managerId);

  const color = getRandomAvatarColor();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6 text-xs flex items-center justify-center">
          <AvatarFallback className={`${color.bg} ${color.text} font-semibold`}>
            {manager?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs">{manager ? manager?.username : "No Manager"}</p>
      </div>
    </div>
  );
}
