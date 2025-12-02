"use client";

import { ReactNode } from "react";

interface MetadataColumnProps {
  icon: ReactNode;
  data: string;
}

const MetadataColumn = ({ icon, data }: MetadataColumnProps) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="truncate">{data}</span>
    </div>
  );
};

export default MetadataColumn;
