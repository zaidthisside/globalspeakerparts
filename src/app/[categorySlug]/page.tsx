import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Package } from 'lucide-react';

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { categorySlug } = await params;

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return { title: 'Category Not Found | Global Speaker Parts' };
  }

  return {
    title: `${category.name} | Global Speaker Parts`,
    description: category.description || `Browse our range of ${category.name} — precision-engineered speaker components from Global Speaker Parts.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, short_desc, featured_image, is_featured, sort_order')
    .eq('category_id', category.id)
    .eq('is_hidden', false)
    .order('sort_order')
    .order('name');

  const productList = products || [];

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs font-sans" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-[#5C5C63] hover:text-[#0F0F10] transition-colors"
          >
            Home
          </Link>
          <span className="text-[#EAEAEA]">/</span>
          <span className="text-[#0F0F10] font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Category Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F0F10] tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm sm:text-base text-[#4A4A4F] font-light max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAEA] bg-[#F7F7F8] text-[10px] uppercase tracking-wider font-bold text-[#5C5C63]">
              <Package size={12} />
              {productList.length} {productList.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {productList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productList.map((product) => (
              <Link
                key={product.id}
                href={`/${categorySlug}/${product.slug}`}
                className="group bg-white border border-[#EAEAEA] rounded-premium overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-[#F7F7F8]">
                  {product.featured_image ? (
                    <img
                      src={product.featured_image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-[#EAEAEA]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 space-y-1.5">
                  {product.is_featured && (
                    <span className="inline-block text-[9px] uppercase tracking-wider font-bold text-accent-cyan">
                      Featured
                    </span>
                  )}
                  <h2 className="font-display font-bold text-sm sm:text-base text-[#0F0F10] leading-snug group-hover:text-accent-cyan transition-colors">
                    {product.name}
                  </h2>
                  {product.short_desc && (
                    <p className="text-sm text-[#4A4A4F] line-clamp-2 font-light">
                      {product.short_desc}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#5C5C63] pt-1 group-hover:text-accent-cyan transition-colors">
                    View Details
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 border border-dashed border-[#EAEAEA] rounded-premium">
            <Package className="h-12 w-12 text-[#EAEAEA] mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-[#0F0F10] mb-1">No Products Yet</h3>
            <p className="text-sm text-[#5C5C63]">
              Products in this category are coming soon.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-6 btn-primary px-5 py-2.5 text-sm"
            >
              Browse All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
