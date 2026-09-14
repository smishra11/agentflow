import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = (user?.user_metadata?.full_name as string) ?? "";
  const email = user?.email ?? "";

  return (
    <SidebarProvider
      defaultOpen={true}
      className="h-screen w-full overflow-hidden"
    >
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-h-0 bg-zinc-950/50">
        <DashboardHeader name={name} email={email} />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
