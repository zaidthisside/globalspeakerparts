import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProductGallery from '@/components/ProductGallery';
import PriceValue from '@/components/PriceValue';
import ProductPageActions from '@/components/ProductPageActions';

import {
  ArrowRight,
  Download,
  FileText,
  MessageCircle,
  Phone,
  Package,
  ChevronRight,
  Tag,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = { params: Promise<{ categorySlug: string; productSlug: string }> };

type Variant = {
  id: string;
  name: string;
  specs: Record<string, string | number | boolean> | null;
  stock: number | null;
  price: number | null;
  is_active: boolean;
  sort_order: number;
  part_numbers: { id: string; code: string }[];
};

type ProductImage = {
  id: string;
  url: string;
  alt_text: string | null;
  order_index: number;
};

type DownloadItem = {
  id: string;
  type: string;
  url: string;
  title: string | null;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  order_index: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  long_desc: string | null;
  featured_image: string | null;
  is_hidden: boolean;
  is_featured: boolean;
  seo_meta: Record<string, any> | null;
  tags: string[] | null;
  applications: string[] | null;
  category: { slug: string; name: string } | null;
  moq: string | null;
};

function normalizeApplications(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProduct(product: any): Product {
  const category = product?.category && typeof product.category === 'object'
    ? {
        slug: typeof product.category.slug === 'string' ? product.category.slug : '',
        name: typeof product.category.name === 'string' ? product.category.name : '',
      }
    : null;

  return {
    ...product,
    category,
    applications: normalizeApplications(product?.applications),
    moq: product?.moq || null,
  } as Product;
}

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  featured_image: string | null;
  category_id: string;
};

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props) {
  const { productSlug } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('name, short_desc, featured_image, category:categories!inner(slug, name)')
    .eq('slug', productSlug)
    .single();

  if (!product) {
    return { title: 'Product Not Found | Global Speaker Parts' };
  }

  const normalizedProduct = normalizeProduct(product);
  const cat = normalizedProduct.category;

  if (!cat) {
    return { title: 'Product Not Found | Global Speaker Parts' };
  }

  return {
    title: `${product.name} — ${cat.name} | Global Speaker Parts`,
    description:
      product.short_desc ||
      `${product.name} by Global Speaker Parts — precision-engineered speaker component.`,
    openGraph: {
      title: `${product.name} | Global Speaker Parts`,
      description: product.short_desc || `Premium ${cat.name} component.`,
      images: product.featured_image ? [{ url: product.featured_image }] : [],
      type: 'website',
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ProductPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;

  /* ── Fetch product ─────────────────────────────────────────────── */
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories!inner(slug, name)')
    .eq('slug', productSlug)
    .single();

  if (!product) notFound();

  const p = normalizeProduct(product);
  const cat = p.category;

  if (!cat) notFound();

  // Validate category slug matches
  if (cat.slug !== categorySlug) notFound();

  /* ── Fetch related data in parallel ────────────────────────────── */
  const [variantsRes, imagesRes, downloadsRes, faqsRes, relatedRes] = await Promise.all([
    supabase
      .from('variants')
      .select('*, part_numbers(*)')
      .eq('product_id', p.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', p.id)
      .order('order_index'),
    supabase
      .from('downloads')
      .select('*')
      .eq('product_id', p.id),
    supabase
      .from('faqs')
      .select('*')
      .eq('product_id', p.id)
      .order('order_index'),
    supabase
      .from('related_products')
      .select('related_product_id')
      .eq('product_id', p.id),
  ]);

  const variants: Variant[] = variantsRes.data || [];
  const images: ProductImage[] = imagesRes.data || [];
  const downloads: DownloadItem[] = downloadsRes.data || [];
  const faqs: FAQ[] = faqsRes.data || [];
  const relatedIds: string[] = (relatedRes.data || []).map(
    (r: { related_product_id: string }) => r.related_product_id
  );

  /* ── Fetch related product details ─────────────────────────────── */
  let relatedProducts: RelatedProduct[] = [];
  if (relatedIds.length > 0) {
    const { data: rp } = await supabase
      .from('products')
      .select('id, name, slug, short_desc, featured_image, category_id')
      .in('id', relatedIds)
      .eq('is_hidden', false);
    relatedProducts = rp || [];
  }

  /* ── Gather specs from first variant ───────────────────────────── */
  const firstSpecs: [string, string][] =
    variants.length > 0 && variants[0].specs
      ? Object.entries(variants[0].specs).map(([k, v]) => [k, String(v)])
      : [];

  /* ── Starting Price ────────────────────────────────────────────── */
  const startingPrice = (() => {
    if (p.seo_meta?.hide_price === true) {
      return "On request";
    }
    if (variants.length > 0) {
      const prices = variants.map(v => parseFloat(v.price as any)).filter(pr => !isNaN(pr));
      if (prices.length > 0) return `$${Math.min(...prices).toFixed(2)}`;
    }
    return "On request";
  })();

  /* ── WhatsApp URL ──────────────────────────────────────────────── */
  const whatsappNumber = '919829062390';
  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in "${p.name}" from Global Speaker Parts. Please share pricing and availability.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  /* ── Hero image ────────────────────────────────────────────────── */
  const heroImage = p.featured_image || (images.length > 0 ? images[0].url : null);

  /* ── JSON-LD ───────────────────────────────────────────────────── */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.short_desc || '',
    image: heroImage || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Global Speaker Parts',
    },
    category: cat.name,
    ...(variants.length > 0 && variants[0].price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: variants[0].price,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* ── Breadcrumb ─────────────────────────────────────────── */}
          <nav className="flex items-center gap-1.5 text-xs font-sans mb-8" aria-label="Breadcrumb">
            <Link href="/" className="text-[#5C5C63] hover:text-[#0F0F10] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-[#EAEAEA]" />
            <Link
              href={`/${cat.slug}`}
              className="text-[#5C5C63] hover:text-[#0F0F10] transition-colors"
            >
              {cat.name}
            </Link>
            <ChevronRight size={12} className="text-[#EAEAEA]" />
            <span className="text-[#0F0F10] font-medium truncate max-w-[200px]">{p.name}</span>
          </nav>

          {/* ── Hero Area ──────────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-14">
            {/* Left — Image */}
            <div className="order-1">
              {heroImage ? (
                <div className="aspect-square overflow-hidden rounded-lg border-2 border-black bg-[#F7F7F8]">
                  <img
                    src={heroImage}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-black bg-[#F7F7F8] flex items-center justify-center">
                  <Package className="h-16 w-16 text-[#EAEAEA]" />
                </div>
              )}
            </div>

            {/* Right — Text */}
            <div className="flex flex-col justify-center space-y-5 order-2">
              <div className="flex items-center gap-3">
                <Link
                  href={`/${cat.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-wider font-bold border border-black rounded-full text-[#5C5C63] hover:bg-black hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
                {p.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold bg-black text-white rounded-full">
                    <Zap size={10} />
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F0F10] leading-tight tracking-tight uppercase">
                {p.name}
              </h1>

              {p.short_desc && (
                <p className="text-sm sm:text-base text-[#4A4A4F] font-light leading-relaxed max-w-lg">
                  {p.short_desc}
                </p>
              )}

              {/* B2B Interactive Panel */}
              <div className="pt-2">
                <ProductPageActions
                  product={{
                    id: p.id,
                    name: p.name,
                    category: cat.name,
                    startingPrice: String(startingPrice),
                    moq: (() => {
                      const productMOQ = p.moq || (() => {
                        if (variants) {
                          for (const v of variants) {
                            if (v.specs) {
                              for (const [key, val] of Object.entries(v.specs)) {
                                if (key.toLowerCase().includes("moq")) return String(val);
                              }
                            }
                          }
                        }
                        return "1,000 units";
                      })();
                      return productMOQ;
                    })(),
                    variants: variants?.map(v => v.name).join(", ") || 'Standard'
                  }}
                  whatsappUrl={whatsappUrl}
                />
              </div>
            </div>
          </section>

          {/* ── Image Gallery ──────────────────────────────────────── */}
          {images.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Gallery</SectionHeading>
              <ProductGallery images={images} productName={p.name} />
            </section>
          )}

          {/* ── Variants Section ───────────────────────────────────── */}
          {variants.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Available Variants</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="border-2 border-black rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow bg-white"
                  >
                    <h3 className="font-display font-bold text-base text-[#0F0F10] uppercase tracking-tight">
                      {v.name}
                    </h3>

                    {/* Specs Table */}
                    {v.specs && Object.keys(v.specs).length > 0 && (
                      <div className="space-y-1.5">
                        {Object.entries(v.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-[#5C5C63] uppercase tracking-wider font-medium">
                              {key}
                            </span>
                            <span className="text-[#0F0F10] font-mono text-right">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price & Stock */}
                    <div className="flex items-center justify-between pt-2 border-t border-black">
                      {v.price && p.seo_meta?.hide_price !== true ? (
                        <span className="font-numbers font-bold text-[#0F0F10]">
                          <PriceValue amount={v.price} />
                        </span>
                      ) : (
                        <span className="text-xs text-[#5C5C63]">On request</span>
                      )}
                      {v.stock !== null && (
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            v.stock > 0
                              ? 'bg-green-50 text-green-700 border-green-700'
                              : 'bg-red-50 text-red-600 border-red-600'
                          }`}
                        >
                          {v.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>

                    {/* Part Numbers */}
                    {v.part_numbers && v.part_numbers.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#5C5C63] block mb-1">
                          Part Numbers
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {v.part_numbers.map((pn) => (
                            <span
                              key={pn.id || pn.code}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F7F7F8] border border-black rounded text-[10px] font-mono text-[#0F0F10]"
                            >
                              <Tag size={9} className="text-[#5C5C63]" />
                              {pn.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Technical Specifications ───────────────────────────── */}
          {firstSpecs.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Technical Specifications</SectionHeading>
              <div className="border-2 border-black rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {firstSpecs.map(([key, value], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-[#F7F7F8]' : 'bg-white'}
                      >
                        <td className="px-5 py-3 text-[#5C5C63] font-medium uppercase text-[10px] tracking-wider w-1/3 border-r border-black">
                          {key}
                        </td>
                        <td className="px-5 py-3 text-[#0F0F10] font-mono text-xs">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Long Description ───────────────────────────────────── */}
          {p.long_desc && (
            <section className="mb-14">
              <SectionHeading>Product Details</SectionHeading>
              <div className="prose prose-sm max-w-none text-[#4A4A4F] leading-relaxed space-y-4 border-2 border-black rounded-lg p-6 bg-white">
                {p.long_desc.split('\n').filter(Boolean).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {/* ── Applications ──────────────────────────────────────── */}
          {p.applications && p.applications.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Applications</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {p.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0F0F10] bg-white border border-black rounded-full"
                  >
                    <Zap size={11} className="text-[#0F0F10]" />
                    {app}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── Downloads ─────────────────────────────────────────── */}
          {downloads.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Downloads</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloads.map((dl) => (
                  <a
                    key={dl.id}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 border-2 border-black rounded-lg hover:shadow-md hover:bg-slate-50 transition-all bg-white"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#F7F7F8] border border-black flex items-center justify-center group-hover:bg-black transition-colors">
                      {dl.type === 'datasheet' ? (
                        <FileText size={18} className="text-[#5C5C63] group-hover:text-white transition-colors" />
                      ) : (
                        <Download size={18} className="text-[#5C5C63] group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F0F10] truncate group-hover:text-accent-cyan transition-colors">
                        {dl.title || dl.type}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-[#5C5C63] font-bold">
                        {dl.type}
                      </p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-[#0F0F10] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ ───────────────────────────────────────────────── */}
          {faqs.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Frequently Asked Questions</SectionHeading>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border-2 border-black rounded-lg p-5 bg-white"
                  >
                    <h3 className="font-display font-bold text-sm text-[#0F0F10] mb-2 uppercase tracking-tight">
                      {faq.question}
                    </h3>
                    <div
                      className="text-sm text-[#4A4A4F] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Related Products ───────────────────────────────────── */}
          {relatedProducts.length > 0 && (
            <section className="mb-14">
              <SectionHeading>Related Products</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/${cat.slug}/${rp.slug}`}
                    className="group border-2 border-black rounded-lg overflow-hidden hover:shadow-md transition-all bg-white"
                  >
                    <div className="aspect-square overflow-hidden bg-[#F7F7F8] border-b border-black">
                      {rp.featured_image ? (
                        <img
                          src={rp.featured_image}
                          alt={rp.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-[#EAEAEA]" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-bold text-sm text-[#0F0F10] group-hover:text-accent-cyan transition-colors line-clamp-2 uppercase tracking-tight">
                        {rp.name}
                      </h3>
                      {rp.short_desc && (
                        <p className="text-xs text-[#4A4A4F] line-clamp-1 mt-1">{rp.short_desc}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Inquiry CTA ───────────────────────────────────────── */}
          <section
            id="inquiry"
            className="mb-14 border-2 border-black rounded-lg p-8 sm:p-12 text-center bg-[#0F0F10]"
          >
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white mb-3 uppercase tracking-tight">
              Request a Quote
            </h2>
            <p className="text-sm text-[#A0A0A5] mb-6 max-w-md mx-auto">
              Get custom pricing for {p.name}. Our team responds within 24 hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0F0F10] font-bold rounded-lg text-[10px] uppercase tracking-wider border-2 border-white hover:bg-[#F7F7F8] transition-colors"
              >
                <MessageCircle size={14} className="text-[#25D366]" />
                WhatsApp Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-bold rounded-lg text-[10px] uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                <Phone size={14} />
                Contact Form
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Heading Helper                                             */
/* ------------------------------------------------------------------ */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="font-display text-lg font-extrabold text-[#0F0F10] tracking-tight uppercase">
        {children}
      </h2>
      <div className="flex-1 h-px bg-black" />
    </div>
  );
}
