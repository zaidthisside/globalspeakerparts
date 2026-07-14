import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

type ImageType = {
  id: string;
  url: string;
  alt_text: string | null;
  order_index: number;
};

type Variant = {
  id: string;
  name: string;
  specs: any;
  stock: number | null;
  price: number | null;
  is_active: boolean;
  part_numbers: { code: string }[];
};

type Download = {
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
  seo_meta: any;
  category: { slug: string; name: string };
  variants: Variant[];
  images: ImageType[];
  downloads: Download[];
  faqs: FAQ[];
  relatedProducts: { slug: string; name: string }[];
};

export const generateMetadata = async ({ params }: { params: { categorySlug: string; productSlug: string } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.productSlug}`);
  if (!res.ok) return { title: 'Product' };
  const data: Product = await res.json();
  return {
    title: data.name,
    description: data.short_desc ?? '',
    openGraph: {
      title: data.name,
      description: data.short_desc ?? '',
      images: data.featured_image ? [{ url: data.featured_image }] : [],
    },
  };
};

export default async function ProductPage({ params }: { params: { categorySlug: string; productSlug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.productSlug}`);
  if (!res.ok) notFound();
  const product: Product = await res.json();

  return (
    <article className="max-w-5xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="mb-12">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:underline">Home</a> /{' '}
          <a href={`/${product.category.slug}`} className="hover:underline">{product.category.name}</a> /{' '}
          <span>{product.name}</span>
        </nav>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
        {product.featured_image && (
          <Image src={product.featured_image} alt={product.name} width={1200} height={600} className="object-cover rounded-lg" />
        )}
        {product.short_desc && <p className="mt-4 text-lg text-gray-700">{product.short_desc}</p>}
      </section>

      {/* Variants Section */}
      {product.variants.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Variants</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {product.variants.map((variant) => (
              <div key={variant.id} className="border border-gray-200 p-4 rounded-lg">
                <h3 className="text-xl font-medium text-gray-800">{variant.name}</h3>
                <pre className="bg-gray-50 p-2 mt-2 rounded overflow-x-auto text-sm">{JSON.stringify(variant.specs, null, 2)}</pre>
                {variant.price && <p className="mt-2 text-primary font-bold">Price: $ {variant.price}</p>}
                {variant.stock !== null && <p className="text-gray-600">Stock: {variant.stock}</p>}
                {variant.part_numbers.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Part Numbers:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {variant.part_numbers.map((pn, i) => (
                        <li key={i}>{pn.code}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Gallery */}
      {product.images.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.images.map((img) => (
              <Image key={img.id} src={img.url} alt={img.alt_text ?? product.name} width={600} height={400} className="object-cover rounded" />
            ))}
          </div>
        </section>
      )}

      {/* Technical Specifications */}
      {product.variants.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technical Specifications</h2>
          {product.variants.map((variant) => (
            <div key={variant.id} className="mb-6">
              <h3 className="text-xl font-medium text-gray-700 mb-2">{variant.name}</h3>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(variant.specs).map(([key, value], idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <th className="p-2 font-medium text-gray-600" style={{ width: '30%' }}>{key}</th>
                      <td className="p-2 text-gray-800">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}

      {/* Downloads */}
      {product.downloads.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Downloads</h2>
          <ul className="list-disc pl-5 space-y-2">
            {product.downloads.map((dl) => (
              <li key={dl.id}>
                <a href={dl.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {dl.title ?? dl.type}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {product.faqs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <dl className="space-y-4">
            {product.faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="font-medium text-gray-700">{faq.question}</dt>
                <dd className="mt-1 text-gray-600" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Related Products */}
      {product.relatedProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {product.relatedProducts.map((rp) => (
              <a key={rp.slug} href={`/${product.category.slug}/${rp.slug}`} className="block border border-gray-200 rounded p-4 hover:shadow-lg transition-shadow">
                <p className="text-gray-800 font-medium">{rp.name}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Inquiry Form */}
      <section className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Request a Quote</h2>
        <form action="/api/inquiry" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" name="productId" value={product.id} />
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" required className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" name="company" id="company" required className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" required className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" name="phone" id="phone" className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea name="message" id="message" rows={4} className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors">
              Submit
            </button>
          </div>
        </form>
      </section>
    </article>
  );
}
