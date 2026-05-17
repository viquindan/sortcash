import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Landing } from "@/components/landing/Landing";

export default async function HomePage() {
  const session = await verifySession();
  if (session?.userId) redirect("/overview");
  return <Landing />;
}
