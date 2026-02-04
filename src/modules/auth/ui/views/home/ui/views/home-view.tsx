"use client";

import { authClient } from "@/lib/auth-client";

export const HomeView = () => {
    const { data, isPending } = authClient.useSession();
    
    return (
    <div className="flex flex-col p-4 gap-y-4">
      {!isPending && data?.user?.name ? `Hello ${data.user.name}` : null}
    </div>
  );
}




