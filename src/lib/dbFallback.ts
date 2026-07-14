import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/lib/local_db.json');

// Helper to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initial default categories & products to populate database on first load
const INITIAL_DB = {
  categories: [
    {
      id: "cat-1",
      name: "Voice Coils",
      slug: "voice-coils",
      description: "Precision-wound high-temperature voice coils using CCAW and copper wire.",
      image_url: "https://images.unsplash.com/photo-1618976186466-b3a5cfc7df57?auto=format&fit=crop&w=600&q=80",
      is_hidden: false,
      sort_order: 0,
      seo_meta: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "cat-2",
      name: "Speaker Cones",
      slug: "speaker-cones",
      description: "High-rigidity pressed pulp, Kevlar and carbon fiber composite speaker cones.",
      image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
      is_hidden: false,
      sort_order: 1,
      seo_meta: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  products: [
    {
      id: "prod-1",
      category_id: "cat-2",
      name: "Carbon Fiber Composite Woofer Cones",
      slug: "carbon-fiber-composite-woofer-cones",
      short_desc: "Rigid composite speaker cones pressed for high-power woofers and high-fidelity automotive mid-bass drivers.",
      long_desc: "Rigid composite speaker cones pressed for high-power woofers and high-fidelity automotive mid-bass drivers. Features precision air-dried pulp matrix, polyurethane coatings, and high durability under extreme loads.",
      featured_image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
      is_hidden: false,
      is_featured: true,
      seo_meta: null,
      tags: ["cones", "carbon fiber"],
      applications: "Automotive audio, high-power subwoofers",
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  variants: [
    {
      id: "var-1",
      product_id: "prod-1",
      name: "5.25 Inch Standard",
      specs: {
        "Diameter": '5.25"',
        "Material": "Carbon Fiber",
        "Edge": "Rubber"
      },
      stock: 1000,
      price: 1.80,
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  part_numbers: [
    {
      id: "pn-1",
      variant_id: "var-1",
      code: "CF-525-R"
    }
  ],
  product_images: [],
  downloads: [],
  faqs: [],
  related_products: []
};

interface LocalDB {
  categories: any[];
  products: any[];
  variants: any[];
  part_numbers: any[];
  product_images: any[];
  downloads: any[];
  faqs: any[];
  related_products: any[];
}

// Read database
export function readDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf8');
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading local db fallback file", err);
    return INITIAL_DB;
  }
}

// Write database
export function writeDB(data: LocalDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing local db fallback file", err);
  }
}

export const localDb = {
  // Categories Table
  categories: {
    list: () => {
      const db = readDB();
      return db.categories.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
    },
    getBySlug: (slug: string) => {
      const db = readDB();
      return db.categories.find(c => c.slug === slug) || null;
    },
    insert: (cat: any) => {
      const db = readDB();
      const newCat = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...cat
      };
      db.categories.push(newCat);
      writeDB(db);
      return newCat;
    },
    update: (slug: string, cat: any) => {
      const db = readDB();
      const idx = db.categories.findIndex(c => c.slug === slug);
      if (idx === -1) return null;
      db.categories[idx] = {
        ...db.categories[idx],
        ...cat,
        updated_at: new Date().toISOString()
      };
      writeDB(db);
      return db.categories[idx];
    },
    delete: (slug: string) => {
      const db = readDB();
      const idx = db.categories.findIndex(c => c.slug === slug);
      if (idx === -1) return false;
      db.categories.splice(idx, 1);
      writeDB(db);
      return true;
    }
  },

  // Products Table
  products: {
    list: (filters?: { categorySlug?: string; search?: string; featured?: boolean }) => {
      const db = readDB();
      let list = db.products.filter(p => !p.is_hidden);

      if (filters?.categorySlug) {
        const cat = db.categories.find(c => c.slug === filters.categorySlug);
        if (cat) {
          list = list.filter(p => p.category_id === cat.id);
        } else {
          return [];
        }
      }

      if (filters?.search) {
        const term = filters.search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(term) || 
          (p.short_desc && p.short_desc.toLowerCase().includes(term))
        );
      }

      if (filters?.featured) {
        list = list.filter(p => p.is_featured);
      }

      // Add category name & slug metadata
      return list.map(p => {
        const cat = db.categories.find(c => c.id === p.category_id);
        return {
          ...p,
          category_name: cat ? cat.name : null,
          category_slug: cat ? cat.slug : null
        };
      }).sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
    },
    getBySlug: (slug: string) => {
      const db = readDB();
      const p = db.products.find(prod => prod.slug === slug);
      if (!p) return null;
      const cat = db.categories.find(c => c.id === p.category_id);
      return {
        ...p,
        category: cat ? { name: cat.name, slug: cat.slug } : null
      };
    },
    insert: (prod: any) => {
      const db = readDB();
      const newProd = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...prod
      };
      db.products.push(newProd);
      writeDB(db);
      return newProd;
    },
    update: (slug: string, prod: any) => {
      const db = readDB();
      const idx = db.products.findIndex(p => p.slug === slug);
      if (idx === -1) return null;
      db.products[idx] = {
        ...db.products[idx],
        ...prod,
        updated_at: new Date().toISOString()
      };
      writeDB(db);
      return db.products[idx];
    },
    delete: (slug: string) => {
      const db = readDB();
      const idx = db.products.findIndex(p => p.slug === slug);
      if (idx === -1) return false;
      const prod = db.products[idx];
      db.products.splice(idx, 1);
      
      // Cascade delete variants, images, downloads, faqs, related products
      db.variants = db.variants.filter(v => v.product_id !== prod.id);
      db.product_images = db.product_images.filter(i => i.product_id !== prod.id);
      db.downloads = db.downloads.filter(d => d.product_id !== prod.id);
      db.faqs = db.faqs.filter(f => f.product_id !== prod.id);
      db.related_products = db.related_products.filter(rp => rp.product_id !== prod.id && rp.related_product_id !== prod.id);

      writeDB(db);
      return true;
    }
  },

  // Variants Table
  variants: {
    listByProduct: (productId: string) => {
      const db = readDB();
      const list = db.variants.filter(v => v.product_id === productId && v.is_active);
      return list.map(v => ({
        ...v,
        part_numbers: db.part_numbers.filter(pn => pn.variant_id === v.id)
      })).sort((a, b) => a.sort_order - b.sort_order);
    },
    insert: (variant: any) => {
      const db = readDB();
      const newVar = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...variant
      };
      db.variants.push(newVar);
      writeDB(db);
      return newVar;
    },
    update: (id: string, variant: any) => {
      const db = readDB();
      const idx = db.variants.findIndex(v => v.id === id);
      if (idx === -1) return null;
      db.variants[idx] = {
        ...db.variants[idx],
        ...variant,
        updated_at: new Date().toISOString()
      };
      writeDB(db);
      return db.variants[idx];
    },
    delete: (id: string) => {
      const db = readDB();
      const idx = db.variants.findIndex(v => v.id === id);
      if (idx === -1) return false;
      db.variants.splice(idx, 1);
      db.part_numbers = db.part_numbers.filter(pn => pn.variant_id !== id);
      writeDB(db);
      return true;
    }
  },

  // Part Numbers Table
  partNumbers: {
    insert: (pn: any) => {
      const db = readDB();
      const newPn = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...pn
      };
      db.part_numbers.push(newPn);
      writeDB(db);
      return newPn;
    },
    delete: (id: string) => {
      const db = readDB();
      const idx = db.part_numbers.findIndex(pn => pn.id === id);
      if (idx === -1) return false;
      db.part_numbers.splice(idx, 1);
      writeDB(db);
      return true;
    }
  },

  // Images Table
  images: {
    listByProduct: (productId: string) => {
      const db = readDB();
      return db.product_images.filter(img => img.product_id === productId).sort((a, b) => a.order_index - b.order_index);
    },
    insert: (img: any) => {
      const db = readDB();
      const newImg = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...img
      };
      db.product_images.push(newImg);
      writeDB(db);
      return newImg;
    },
    update: (id: string, img: any) => {
      const db = readDB();
      const idx = db.product_images.findIndex(i => i.id === id);
      if (idx === -1) return null;
      db.product_images[idx] = {
        ...db.product_images[idx],
        ...img
      };
      writeDB(db);
      return db.product_images[idx];
    },
    delete: (id: string) => {
      const db = readDB();
      const idx = db.product_images.findIndex(i => i.id === id);
      if (idx === -1) return false;
      db.product_images.splice(idx, 1);
      writeDB(db);
      return true;
    }
  },

  // Downloads Table
  downloads: {
    listByProduct: (productId: string) => {
      const db = readDB();
      return db.downloads.filter(d => d.product_id === productId);
    },
    insert: (dl: any) => {
      const db = readDB();
      const newDl = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...dl
      };
      db.downloads.push(newDl);
      writeDB(db);
      return newDl;
    },
    delete: (id: string) => {
      const db = readDB();
      const idx = db.downloads.findIndex(d => d.id === id);
      if (idx === -1) return false;
      db.downloads.splice(idx, 1);
      writeDB(db);
      return true;
    }
  },

  // FAQs Table
  faqs: {
    listByProduct: (productId: string) => {
      const db = readDB();
      return db.faqs.filter(f => f.product_id === productId).sort((a, b) => a.order_index - b.order_index);
    },
    insert: (faq: any) => {
      const db = readDB();
      const newFaq = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...faq
      };
      db.faqs.push(newFaq);
      writeDB(db);
      return newFaq;
    },
    update: (id: string, faq: any) => {
      const db = readDB();
      const idx = db.faqs.findIndex(f => f.id === id);
      if (idx === -1) return null;
      db.faqs[idx] = {
        ...db.faqs[idx],
        ...faq
      };
      writeDB(db);
      return db.faqs[idx];
    },
    delete: (id: string) => {
      const db = readDB();
      const idx = db.faqs.findIndex(f => f.id === id);
      if (idx === -1) return false;
      db.faqs.splice(idx, 1);
      writeDB(db);
      return true;
    }
  }
};
