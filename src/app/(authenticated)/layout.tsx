import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { cookies } from "next/headers";
import { User } from "@/lib/types";
import Header from "@/components/sidebar/header";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const user = (await cookies()).get("user");
  let userData: User | null = null;
  if (user) {
    userData = JSON.parse(user?.value || "{}");
  }

  return (
    <SidebarProvider>
      {user && userData && (
        <AppSidebar
          user={{
            User_Name: userData.User_Name,
            User_id: userData.User_id,
            First_Name: userData.First_Name,
            Last_Name: userData.Last_Name,
            User_Email: userData.User_Email,
            Session_ID: userData.Session_ID,
            Agency_Name: userData.Agency_Name,
            User_Role: userData.User_Role,
          }}
        />
      )}

      <SidebarInset>
        {user && userData && <Header user={userData} />}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
