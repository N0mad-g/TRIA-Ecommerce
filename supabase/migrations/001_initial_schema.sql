-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cabelo', 'Styling', 'Barba')),
    active_ingredients JSONB NOT NULL DEFAULT '{}'::jsonb,
    inci TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protocols Table
CREATE TABLE public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('Origin', 'Reconstruct', 'Define', 'Complete')),
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2) NOT NULL,
    products UUID[] NOT NULL,
    narrative TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    last_quiz_recommendation UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Diagnoses Table
CREATE TABLE public.user_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    answers JSONB NOT NULL,
    recommended_protocol_id UUID REFERENCES public.protocols(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    protocol_id UUID REFERENCES public.protocols(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
    gateway_subscription_id TEXT UNIQUE NOT NULL,
    next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own diagnoses" ON public.user_diagnoses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnoses" ON public.user_diagnoses
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Seed Data: Products
INSERT INTO public.products (sku, name, price, category, active_ingredients, inci) VALUES
  ('TRIA-P1', 'Shampoo Reconstrutor', 89.90, 'Cabelo', '{"silk_proteins": "Restore elasticity", "keratin": "Strengthen strands"}', 'Aqua, Silicones, Keratin, Amino Acids'),
  ('TRIA-P2', 'Condicionador Profundo', 99.90, 'Cabelo', '{"panthenol": "Moisturize", "argan_oil": "Nourish"}', 'Aqua, Argan Oil, Panthenol, Natural Oils'),
  ('TRIA-P3', 'Sérum Capilar', 129.90, 'Styling', '{"niacinamide": "Protect", "biotin": "Strengthen"}', 'Cyclopentasiloxane, Niacinamide, Biotin, Antioxidants'),
  ('TRIA-P4', 'Bálsamo para Barba', 85.00, 'Barba', '{"jojoba_oil": "Condition", "beeswax": "Define"}', 'Beeswax, Jojoba Oil, Shea Butter, Essential Oils'),
  ('TRIA-P5', 'Tônico Capilar', 119.90, 'Cabelo', '{"caffeine": "Stimulate", "zinc": "Regulate"}', 'Aqua, Caffeine, Zinc, Plant Extracts');

-- Seed Data: Protocols
INSERT INTO public.protocols (name, price, original_price, products, narrative) VALUES
  ('Origin', 249.90, 314.70, ARRAY['p1', 'p2', 'p4']::uuid[], 'Comece sua jornada de reconstrução capilar com o protocolo Origin.'),
  ('Reconstruct', 329.90, 414.70, ARRAY['p1', 'p2', 'p3', 'p5']::uuid[], 'Recuperação ativa para pós-operatório recente e queda ativa.'),
  ('Define', 189.90, 214.80, ARRAY['p4', 'p5']::uuid[], 'Soluções premium especializadas para uma barba impecável.'),
  ('Complete', 449.90, 564.50, ARRAY['p1', 'p2', 'p3', 'p4', 'p5']::uuid[], 'A solução mais abrangente: cabelo e barba em um protocolo.') ON CONFLICT (name) DO NOTHING;
