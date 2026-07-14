import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  slug: string;
  thumbnail_url: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  products: Product[];
};

export const generateMetadata = async ({ params }: { params: { categorySlug: string } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${params.categorySlug}`);
  if (!res.ok) return { title: 'Category' };
  const data: Category = await res.json();
  return { title: data.name };
};

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${params.categorySlug}`);
  if (!res.ok) notFound();
  const category: Category = await res.json();

  return (
    <section className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{category.name}</h1>
      {category.description && <p className="mb-8 text-gray-600">{category.description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {category.products.map((product) => (
          <Link key={product.id} href={`/${category.slug}/${product.slug}`} className="group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img src={product.thumbnail_url} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-800 group-hover:text-primary transition-colors">{product.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
