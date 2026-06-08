import { verifySession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { Sidebar } from "@/components/ui/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session?.userId) {
    redirect("/sign-in");
  }

  async function handleLogout() {
    "use server";
    deleteSession();
    redirect("/sign-in");
  }

  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex bg-background min-h-screen">
      <NavigationProgress />
      <Sidebar email={session.email} initials={initials} logoutAction={handleLogout} />

      {/* Main Content — offset for desktop sidebar, top padding for mobile header */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex-1 overflow-auto pt-14 md:pt-0 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
