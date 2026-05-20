export const WA_NUMBER = "94770000000"; // demo placeholder
export const BUSINESS_NAME = "Serenity Wellness";
export const BUSINESS_PHONE = "+94 77 000 0000";
export const BUSINESS_EMAIL = "hello@serenitywellness.lk";
export const BUSINESS_LOCATION = "Negombo, Sri Lanka";
export const BUSINESS_HOURS = "Mon–Sun · 6:00 AM – 9:00 PM";

export const BANK_DETAILS = {
  bank: "Commercial Bank of Ceylon",
  holder: "Serenity Wellness Center (Pvt) Ltd",
  account: "8001-2345-6789",
  branch: "Negombo Main Branch",
  swift: "CCEYLKLX",
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const h = 6 + i;
  const period = h >= 12 ? "PM" : "AM";
  const hh = h > 12 ? h - 12 : h;
  return `${hh.toString().padStart(2, "0")}:00 ${period}`;
});

export const CATEGORY_LABEL: Record<string, string> = {
  yoga: "Yoga",
  massage: "Massage",
  counselling: "Counselling",
  therapy: "Therapy",
  mixed: "Mixed Bundle",
};

export const CATEGORY_COLOR: Record<string, string> = {
  yoga: "bg-[oklch(0.92_0.06_150)] text-[oklch(0.3_0.08_150)]",
  massage: "bg-[oklch(0.92_0.05_60)] text-[oklch(0.35_0.1_60)]",
  counselling: "bg-[oklch(0.92_0.05_220)] text-[oklch(0.35_0.08_220)]",
  therapy: "bg-[oklch(0.92_0.05_300)] text-[oklch(0.35_0.08_300)]",
  mixed: "bg-gold-soft text-[oklch(0.3_0.06_80)]",
};
