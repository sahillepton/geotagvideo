import { getVideoList } from "@/components/sidebar/action";
import SurveyTable from "@/components/survey-table";
import { Badge } from "@/components/ui/badge";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const experimental_ppr = true;

const Page = async () => {
  const user = (await cookies()).get("user");
  if (!user) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["videos", 1, {}],
    queryFn: async () => {
      const data = await getVideoList({}, 1, 10);
      return JSON.parse(data.data).Result;
    },
  });

  const userData = JSON.parse(user.value);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance text-[#262626] dark:text-white">
          Geotagged Videos
        </h1>

        <SurveyTable currentUser={userData} />
      </div>
    </HydrationBoundary>
  );
};

export default Page;
