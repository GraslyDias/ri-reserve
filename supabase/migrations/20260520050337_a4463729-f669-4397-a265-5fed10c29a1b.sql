
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Categories enum
CREATE TYPE public.package_category AS ENUM ('yoga', 'massage', 'counselling', 'therapy', 'mixed');
CREATE TYPE public.package_type AS ENUM ('individual', 'group');
CREATE TYPE public.inquiry_status AS ENUM ('new', 'contacted', 'payment_pending', 'payment_received', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('no_payment', 'bank_transfer');

-- Packages
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category package_category NOT NULL,
  type package_type NOT NULL DEFAULT 'individual',
  duration_minutes INT NOT NULL DEFAULT 60,
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price_lkr INT,
  discount_percent INT DEFAULT 0,
  max_capacity INT DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active packages" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage packages" ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Inquiries
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  package_type package_type NOT NULL DEFAULT 'individual',
  participants INT NOT NULL DEFAULT 1,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'no_payment',
  special_requirements TEXT,
  status inquiry_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone creates inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Confirmed bookings
CREATE TABLE public.confirmed_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  package_type package_type NOT NULL,
  customer_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  participants INT NOT NULL DEFAULT 1,
  max_capacity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.confirmed_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views confirmed bookings" ON public.confirmed_bookings FOR SELECT USING (true);
CREATE POLICY "Admins manage bookings" ON public.confirmed_bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to bump updated_at on inquiries
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER inquiries_touch BEFORE UPDATE ON public.inquiries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
