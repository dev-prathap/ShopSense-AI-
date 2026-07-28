import { checkStoreAccess, validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Shield, Trash2 } from "lucide-react";

/**
 * Still a stub, but guarded now so it cannot ship as an open endpoint: it is
 * reachable as a plain POST independently of the page, and storeId comes from
 * the caller. Whatever sends the real invitation goes after this check.
 */
async function inviteMember(formData: FormData) {
  "use server";
  const email = String(formData.get("email"));
  const role = String(formData.get("role"));
  const storeId = String(formData.get("storeId"));

  if (!(await checkStoreAccess(storeId))) return;

  // In a real app, send email invitation here
  console.log(`Inviting ${email} as ${role} to store ${storeId}`);
}

export default async function TeamPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  
  const memberships = await prisma.appUserStoreMembership.findMany({
    where: { storeId },
    include: {
      appUser: true
    }
  });

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/team?storeId=${storeId}`, label: "Team", active: true },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Team Management"
          subtitle="Manage your store administrators and staff permissions."
          action={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
              <UserPlus size={18} />
              Invite Member
            </Button>
          }
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
                <CardTitle className="text-lg font-bold text-slate-900">Active Members</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">People who have access to this store.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {memberships.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {m.appUser.name?.[0] || m.appUser.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.appUser.name || "Pending User"}</p>
                          <p className="text-xs font-medium text-slate-500">{m.appUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="capitalize px-3 py-1 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] tracking-widest uppercase">
                          {m.role}
                        </Badge>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card border-none shadow-lg rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-blue-600 text-white p-8">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Mail size={20} />
                  New Invitation
                </CardTitle>
                <CardDescription className="text-blue-100/80 text-sm font-medium mt-1">Send an invite to join your team.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form action={inviteMember} className="space-y-6">
                  <input type="hidden" name="storeId" value={storeId} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                    <Input name="email" type="email" placeholder="colleague@brand.com" required className="h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Team Role</label>
                    <select name="role" className="w-full h-12 border-slate-200 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none">
                      <option value="owner">Owner</option>
                      <option value="staff">Staff</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Send Invite
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-md rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security Note</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                    Invitations expire after 48 hours. Team members with 'Owner' role can manage store configuration and billing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
