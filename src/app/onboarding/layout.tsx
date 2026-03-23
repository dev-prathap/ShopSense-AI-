import { redirect } from "next/navigation";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readAppSessionFromServerComponent();

  // Only authenticated users can access onboarding
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {children}
    </div>
  );
}
