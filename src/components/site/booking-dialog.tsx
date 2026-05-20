import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { TIME_SLOTS, BANK_DETAILS, whatsappUrl } from "@/lib/site";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name required").max(100),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  whatsapp: z.string().max(20).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  package_id: z.string().min(1, "Select a package"),
  package_type: z.enum(["individual", "group"]),
  participants: z.number().min(1).max(20),
  preferred_date: z.date({ message: "Pick a date" }),
  preferred_time: z.string().min(1, "Pick a time"),
  payment_method: z.enum(["no_payment", "bank_transfer"]),
  special_requirements: z.string().max(800).optional(),
});

type FormData = z.infer<typeof schema>;

interface Package {
  id: string;
  name: string;
  type: "individual" | "group";
  max_capacity: number | null;
}

export function BookingDialog({
  open, onOpenChange, packages, preselectedId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  packages: Package[];
  preselectedId?: string | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: "", phone: "", whatsapp: "", email: "",
      package_id: preselectedId ?? "",
      package_type: "individual",
      participants: 1,
      preferred_time: "",
      payment_method: "no_payment",
      special_requirements: "",
    },
  });

  useEffect(() => {
    if (open) {
      setSuccess(false);
      const pkg = packages.find((p) => p.id === preselectedId);
      form.reset({
        ...form.getValues(),
        package_id: preselectedId ?? form.getValues("package_id"),
        package_type: pkg?.type ?? "individual",
        participants: pkg?.type === "group" ? 2 : 1,
      });
    }
  }, [open, preselectedId]);

  const watchType = form.watch("package_type");
  const watchPay = form.watch("payment_method");
  const watchPkg = form.watch("package_id");

  useEffect(() => {
    const pkg = packages.find((p) => p.id === watchPkg);
    if (pkg) {
      form.setValue("package_type", pkg.type);
      if (pkg.type === "individual") form.setValue("participants", 1);
      else if (form.getValues("participants") < 2) form.setValue("participants", 2);
    }
  }, [watchPkg]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    const pkg = packages.find((p) => p.id === values.package_id);
    const { error } = await supabase.from("inquiries").insert({
      customer_name: values.customer_name,
      phone: values.phone,
      whatsapp: values.whatsapp || values.phone,
      email: values.email || null,
      package_id: values.package_id,
      package_name: pkg?.name ?? "Package",
      package_type: values.package_type,
      participants: values.participants,
      preferred_date: format(values.preferred_date, "yyyy-MM-dd"),
      preferred_time: values.preferred_time,
      payment_method: values.payment_method,
      special_requirements: values.special_requirements || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not send inquiry", { description: error.message });
      return;
    }
    toast.success("Your inquiry has been sent!", {
      description: "We'll contact you within 2 hours.",
    });
    setSuccess(true);
  }

  function openWhatsApp() {
    const v = form.getValues();
    const pkg = packages.find((p) => p.id === v.package_id);
    const msg = [
      `Hi Serenity Wellness! I'd like to book:`,
      `• Package: ${pkg?.name ?? "—"}`,
      `• Date: ${v.preferred_date ? format(v.preferred_date, "PPP") : "—"} at ${v.preferred_time || "—"}`,
      `• Participants: ${v.participants}`,
      `• Name: ${v.customer_name}`,
      `• Phone: ${v.phone}`,
    ].join("\n");
    window.open(whatsappUrl(msg), "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            {success ? "Inquiry received" : "Book a Session"}
          </DialogTitle>
          <DialogDescription>
            {success
              ? "We've saved your request. Our team will reach out within 2 hours to confirm."
              : "Tell us a little about your visit and we'll personally confirm your slot."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-5 py-2">
            {watchPay === "bank_transfer" && (
              <BankCard />
            )}
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" onClick={openWhatsApp} className="flex-1">
                <MessageCircle className="h-4 w-4" /> Send WhatsApp confirmation
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={form.formState.errors.customer_name?.message}>
                <Input {...form.register("customer_name")} placeholder="Your name" />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} placeholder="+94 77 123 4567" />
              </Field>
              <Field label="WhatsApp (optional)">
                <Input {...form.register("whatsapp")} placeholder="Defaults to phone" />
              </Field>
              <Field label="Email (optional)" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register("email")} placeholder="you@email.com" />
              </Field>
            </div>

            <Field label="Package" error={form.formState.errors.package_id?.message}>
              <Select
                value={form.watch("package_id")}
                onValueChange={(v) => form.setValue("package_id", v, { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Choose a package" /></SelectTrigger>
                <SelectContent>
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Session type">
              <RadioGroup
                value={watchType}
                onValueChange={(v) => form.setValue("package_type", v as "individual" | "group")}
                className="flex gap-6"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="individual" /> Individual
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="group" /> Group
                </label>
              </RadioGroup>
            </Field>

            {watchType === "group" && (
              <Field label="Number of participants">
                <Input
                  type="number" min={2} max={20}
                  {...form.register("participants", { valueAsNumber: true })}
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preferred date" error={form.formState.errors.preferred_date?.message}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button" variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("preferred_date") && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {form.watch("preferred_date")
                        ? format(form.watch("preferred_date"), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("preferred_date")}
                      onSelect={(d) => d && form.setValue("preferred_date", d, { shouldValidate: true })}
                      disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field label="Preferred time" error={form.formState.errors.preferred_time?.message}>
                <Select
                  value={form.watch("preferred_time")}
                  onValueChange={(v) => form.setValue("preferred_time", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Pick a time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Payment preference">
              <RadioGroup
                value={watchPay}
                onValueChange={(v) => form.setValue("payment_method", v as "no_payment" | "bank_transfer")}
                className="grid gap-2 sm:grid-cols-2"
              >
                <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="no_payment" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Book without payment</div>
                    <div className="text-xs text-muted-foreground">Pay later on arrival</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="bank_transfer" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Advance bank transfer</div>
                    <div className="text-xs text-muted-foreground">Confirms your slot faster</div>
                  </div>
                </label>
              </RadioGroup>
            </Field>

            <Field label="Special requirements (optional)">
              <Textarea
                rows={3}
                {...form.register("special_requirements")}
                placeholder="Injuries, accessibility, preferences…"
              />
            </Field>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Inquiry
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function BankCard() {
  return (
    <div className="rounded-xl border-2 border-gold/40 bg-gold-soft/30 p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-gold">
        Bank transfer details
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <Row k="Bank" v={BANK_DETAILS.bank} />
        <Row k="Account holder" v={BANK_DETAILS.holder} />
        <Row k="Account no." v={BANK_DETAILS.account} />
        <Row k="Branch" v={BANK_DETAILS.branch} />
        <Row k="SWIFT" v={BANK_DETAILS.swift} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Payment confirms your slot. Send the receipt via WhatsApp and our admin will confirm within 2 hours.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}
