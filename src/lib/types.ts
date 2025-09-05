export type User = {
    User_Name: string;
    First_Name: string;
    Last_Name: string;
    User_Email: string | null;
    Session_ID: string;
    Agency_Name: string;
    User_Role: "SuperAdmin" | "Admin" | "User" | string;
    User_id: number;
  };
  