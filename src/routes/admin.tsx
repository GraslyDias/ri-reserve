import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Inbox, CalendarCheck, Wallet, Loader2, LogOut, Flower2,
  MessageCircle, ShieldAlert, Check, X, Eye,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/admin")({ component: AdminRoute });

type Status = "new" | "contacted" | "payment_pending" | "payment_received" | "confirmed" | "completed" | "cancelled";

interface Inquiry {
  id: string; customer_name: string; phone: string; whatsapp: string | null;
  email: string | null; package_id: string | null; package_name: string;
  package_type: "individual" | "group"; participants: number;
  preferred_date: string; preferred_time: string;
  payment_method: "no_payment" | "bank_transfer";
  special_requirements: string | null;
  status: Status; admin_notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<Status, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-indigo-100 text-indigo-800",
  payment_pending: "bg-amber-100 text-amber-800",
  payment_received: "bg-emerald-100 text-emerald-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<Status, string> = {
  new: "New Inquiry",
  contacted: "Contacted",
  payment_pending: "Payment Pending",
  payment_received: "Payment Received",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AdminRoute() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setIsAdmin(null); setChecking(false); }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data } = await supabase.from("user_roles")
          .select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
      }
      setChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && isAdmin === null) {
      supabase.from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    }
  }, [session]);

  if (checking) return <LoadingScreen />;
  if (!session) return <Login />;
  if (isAdmin === false) return <NotAdmin />;
  if (!isAdmin) return <LoadingScreen />;
  return <Dashboard session={session} />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/admin" : undefined },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (data.user) {
        toast.success("Account created", {
          description: "Ask an existing admin to grant you the admin role.",
        });
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-5 text-ivory">
      <Card className="w-full max-w-md border-gold/30 bg-card/95 text-foreground shadow-soft">
        <CardHeader>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient">
              <Flower2 className="h-4 w-4 text-[oklch(0.2_0.03_80)]" />
            </span>
            <span className="font-display text-lg">Serenity Admin</span>
          </Link>
          <CardTitle className="mt-4 font-display text-2xl">
            {mode === "signin" ? "Sign in" : "Create admin account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Access the booking management dashboard."
              : "First user can be granted admin via the database."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button variant="forest" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <button
              type="button"
              onClick={() => setMode((m) => m === "signin" ? "signup" : "signin")}
              className="block w-full text-center text-xs text-muted-foreground hover:text-primary"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function NotAdmin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <ShieldAlert className="h-8 w-8 text-amber-500" />
          <CardTitle className="font-display">Access pending</CardTitle>
          <CardDescription>
            Your account exists but isn't an admin yet. An existing admin must grant you the role from the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <Button variant="forest" asChild><Link to="/">Back to site</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ session }: { session: any }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [viewing, setViewing] = useState<Inquiry | null>(null);

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    return {
      today: inquiries.filter((i) => i.created_at.slice(0, 10) === today).length,
      pending: inquiries.filter((i) => ["new", "contacted"].includes(i.status)).length,
      confirmed: inquiries.filter((i) => i.status === "confirmed" && i.created_at.slice(0, 10) >= weekAgo).length,
      unverified: inquiries.filter((i) => i.payment_method === "bank_transfer" && i.status !== "payment_received" && i.status !== "confirmed" && i.status !== "completed").length,
    };
  }, [inquiries]);

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmBooking = useMutation({
    mutationFn: async (inq: Inquiry) => {
      const { error: e1 } = await supabase.from("confirmed_bookings").insert({
        inquiry_id: inq.id,
        package_id: inq.package_id,
        package_name: inq.package_name,
        package_type: inq.package_type,
        customer_name: inq.customer_name,
        booking_date: inq.preferred_date,
        booking_time: inq.preferred_time,
        participants: inq.participants,
        max_capacity: inq.package_type === "group" ? 8 : 1,
      });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("inquiries").update({ status: "confirmed" }).eq("id", inq.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
      qc.invalidateQueries({ queryKey: ["confirmed_bookings"] });
      toast.success("Booking confirmed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient">
              <Flower2 className="h-4 w-4 text-[oklch(0.2_0.03_80)]" />
            </span>
            <span className="font-display text-lg">Serenity Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard i={Inbox} label="Inquiries Today" value={stats.today} />
          <StatCard i={ShieldAlert} label="Pending Review" value={stats.pending} />
          <StatCard i={CalendarCheck} label="Confirmed This Week" value={stats.confirmed} />
          <StatCard i={Wallet} label="Unverified Payments" value={stats.unverified} />
        </div>

        <Tabs defaultValue="inquiries" className="mt-8">
          <TabsList>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries" className="mt-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Inquiry management</CardTitle>
                  <CardDescription>Review, contact and confirm new bookings.</CardDescription>
                </div>
                <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No inquiries yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Date / Time</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((inq) => (
                        <TableRow key={inq.id}>
                          <TableCell>
                            <div className="font-medium">{inq.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{inq.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div>{inq.package_name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {inq.package_type} · {inq.participants} {inq.participants === 1 ? "person" : "people"}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(inq.preferred_date), "PP")}<br />
                            <span className="text-xs text-muted-foreground">{inq.preferred_time}</span>
                          </TableCell>
                          <TableCell className="text-xs capitalize">
                            {inq.payment_method.replace("_", " ")}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[inq.status]}>{STATUS_LABEL[inq.status]}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => setViewing(inq)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" asChild>
                                <a href={whatsappUrl(`Hi ${inq.customer_name}, this is Serenity Wellness regarding your ${inq.package_name} booking.`)} target="_blank" rel="noreferrer">
                                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                                </a>
                              </Button>
                              {inq.status !== "confirmed" && inq.status !== "completed" && (
                                <Button size="icon" variant="ghost" onClick={() => confirmBooking.mutate(inq)} title="Confirm">
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {inq.status !== "cancelled" && (
                                <Button size="icon" variant="ghost" onClick={() => updateStatus.mutate({ id: inq.id, status: "cancelled" })} title="Cancel">
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Payment verification</CardTitle>
                <CardDescription>Bank transfer inquiries needing verification.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inquiries.filter((i) => i.payment_method === "bank_transfer").map((inq) => (
                    <div key={inq.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                      <div>
                        <div className="font-medium">{inq.customer_name} · {inq.package_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(inq.preferred_date), "PP")} · {inq.preferred_time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[inq.status]}>{STATUS_LABEL[inq.status]}</Badge>
                        <Select value={inq.status} onValueChange={(v) => updateStatus.mutate({ id: inq.id, status: v as Status })}>
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {inquiries.filter((i) => i.payment_method === "bank_transfer").length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">No bank transfer inquiries.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{viewing.customer_name}</DialogTitle>
                <DialogDescription>{viewing.package_name}</DialogDescription>
              </DialogHeader>
              <dl className="space-y-2 text-sm">
                <Detail k="Phone" v={viewing.phone} />
                <Detail k="WhatsApp" v={viewing.whatsapp || viewing.phone} />
                <Detail k="Email" v={viewing.email || "—"} />
                <Detail k="Type" v={`${viewing.package_type} · ${viewing.participants}`} />
                <Detail k="Date" v={format(new Date(viewing.preferred_date), "PPP")} />
                <Detail k="Time" v={viewing.preferred_time} />
                <Detail k="Payment" v={viewing.payment_method.replace("_", " ")} />
                <Detail k="Status" v={STATUS_LABEL[viewing.status]} />
                {viewing.special_requirements && <Detail k="Notes" v={viewing.special_requirements} />}
              </dl>
              <Select value={viewing.status} onValueChange={(v) => { updateStatus.mutate({ id: viewing.id, status: v as Status }); setViewing({ ...viewing, status: v as Status }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ i: I, label, value }: { i: typeof Inbox; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <I className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-3xl text-primary">{value}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}
