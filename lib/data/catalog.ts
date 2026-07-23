import { createServerSupabaseClient } from '@/lib/supabase/server';

// Tipos conceituais (Architecture Seção 4.1/4.2) — camelCase, mapeados a partir
// das colunas snake_case do banco (schema-design.md Seção 4).

export interface SocialProof {
  rating: number;
  customerCount: string;
  resultPercentage: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'cabelo' | 'barba';
  volume: string;
  priceCents: number;
  activeIngredients: string[];
  stripePriceId: string;
  imageUrl: string;
  socialProof: SocialProof;
  relatedProtocolIds: string[];
}

export interface Protocol {
  id: string;
  slug: string;
  name: string;
  productIds: string[];
  monthlyPriceCents: number;
  annualPriceCents: number;
  oneTimeEquivalentPriceCents: number;
  isFeatured: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  volume: string;
  price_cents: number;
  active_ingredients: string[];
  stripe_price_id: string;
  image_url: string;
  social_proof_rating: number;
  social_proof_customer_count: string;
  social_proof_result_percentage: number;
}

interface ProtocolRow {
  id: string;
  slug: string;
  name: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  one_time_equivalent_price_cents: number;
  is_featured: boolean;
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
}

interface JunctionRow {
  protocol_id: string;
  product_id: string;
}

function mapProductRow(row: ProductRow, relatedProtocolIds: string[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as 'cabelo' | 'barba',
    volume: row.volume,
    priceCents: row.price_cents,
    activeIngredients: row.active_ingredients,
    stripePriceId: row.stripe_price_id,
    imageUrl: row.image_url,
    socialProof: {
      rating: row.social_proof_rating,
      customerCount: row.social_proof_customer_count,
      resultPercentage: row.social_proof_result_percentage,
    },
    relatedProtocolIds,
  };
}

function mapProtocolRow(row: ProtocolRow, productIds: string[]): Protocol {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    productIds,
    monthlyPriceCents: row.monthly_price_cents,
    annualPriceCents: row.annual_price_cents,
    oneTimeEquivalentPriceCents: row.one_time_equivalent_price_cents,
    isFeatured: row.is_featured,
    stripePriceIdMonthly: row.stripe_price_id_monthly,
    stripePriceIdAnnual: row.stripe_price_id_annual,
  };
}

/**
 * Todos os produtos, com `relatedProtocolIds` resolvido via `protocol_products`
 * (junção única — Architecture 7.1, não são colunas diretas).
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: products, error: productsError }, { data: junctions, error: junctionsError }] =
    await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('protocol_products').select('protocol_id, product_id'),
    ]);

  if (productsError) throw productsError;
  if (junctionsError) throw junctionsError;

  return (products as ProductRow[]).map((row) => {
    const relatedProtocolIds = (junctions as JunctionRow[])
      .filter((j) => j.product_id === row.id)
      .map((j) => j.protocol_id);
    return mapProductRow(row, relatedProtocolIds);
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

/**
 * Todos os protocolos, ordenados por `monthlyPriceCents` DESC — serve direto a
 * regra de tiebreaker do FR5 (Architecture 4.1) sem sort adicional no client.
 * `productIds` resolvido via `protocol_products`.
 */
export async function getProtocols(): Promise<Protocol[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: protocols, error: protocolsError }, { data: junctions, error: junctionsError }] =
    await Promise.all([
      supabase.from('protocols').select('*').order('monthly_price_cents', { ascending: false }),
      supabase.from('protocol_products').select('protocol_id, product_id'),
    ]);

  if (protocolsError) throw protocolsError;
  if (junctionsError) throw junctionsError;

  return (protocols as ProtocolRow[]).map((row) => {
    const productIds = (junctions as JunctionRow[])
      .filter((j) => j.protocol_id === row.id)
      .map((j) => j.product_id);
    return mapProtocolRow(row, productIds);
  });
}
