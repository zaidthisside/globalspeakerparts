import { createClient } from "@supabase/supabase-js";
import { localDb } from "./dbFallback";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Global flag to use local JSON database fallback when tables are missing in Supabase
let useLocalFallback = false;

export function isLocalFallbackEnabled() {
  return useLocalFallback;
}

// Check if categories table exists on load
realSupabase.from('categories').select('id', { count: 'exact', head: true }).then(({ error }) => {
  if (error && error.code === 'PGRST205') {
    console.log("Supabase categories table not found. Enabling local JSON database fallback.");
    useLocalFallback = true;
  }
});

function normalizeStringArray(value: unknown): string[] {
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

function normalizeProductRecord(product: any, db: any) {
  const relation = product.category ?? product.categories ?? null;
  const categoryFromRelation = relation && typeof relation === 'object'
    ? {
        id: relation.id ?? null,
        name: relation.name ?? null,
        slug: relation.slug ?? null,
      }
    : null;

  const categoryFromId = !categoryFromRelation && product.category_id
    ? db.categories.find((c: any) => c.id === product.category_id)
    : null;

  const normalizedCategory = categoryFromRelation || (categoryFromId ? {
    id: categoryFromId.id,
    name: categoryFromId.name,
    slug: categoryFromId.slug,
  } : null);

  return {
    ...product,
    category: normalizedCategory,
    categories: normalizedCategory ? {
      id: normalizedCategory.id,
      name: normalizedCategory.name,
      slug: normalizedCategory.slug,
    } : null,
    category_name: normalizedCategory?.name ?? product.category_name ?? null,
    category_slug: normalizedCategory?.slug ?? product.category_slug ?? null,
    applications: normalizeStringArray(product.applications),
    tags: normalizeStringArray(product.tags),
  };
}

// A lightweight mock Postgrest query builder that operates on local JSON database
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<{ type: string; col?: string; val?: any; condition?: string }> = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private isSingle = false;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private actionData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string) {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
      this.action = 'select';
    }
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.actionData = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.actionData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  in(col: string, val: any[]) {
    this.filters.push({ type: 'in', col, val });
    return this;
  }

  or(condition: string) {
    this.filters.push({ type: 'or', condition });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // To support thenable interface for async/await
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const table = this.tableName;
      const data = localDb as any;

      if (this.action === 'select') {
        let list: any[] = [];
        
        // Fetch base table list
        if (table === 'categories') {
          list = localDb.categories.list();
        } else if (table === 'products') {
          const db = require('./dbFallback').readDB();
          list = localDb.products.list().map((p: any) => {
            const vars = db.variants.filter((v: any) => v.product_id === p.id && v.is_active);
            return normalizeProductRecord({
              ...p,
              variants: vars.map((v: any) => ({
                ...v,
                part_numbers: db.part_numbers.filter((pn: any) => pn.variant_id === v.id)
              }))
            }, db);
          });
        } else if (table === 'variants') {
          const prodFilter = this.filters.find(f => f.col === 'product_id');
          if (prodFilter) {
            list = localDb.variants.listByProduct(prodFilter.val);
          } else {
            const db = require('./dbFallback').readDB();
            list = db.variants;
          }
        } else if (table === 'part_numbers') {
          const db = require('./dbFallback').readDB();
          list = db.part_numbers;
        } else if (table === 'product_images') {
          const prodFilter = this.filters.find(f => f.col === 'product_id');
          if (prodFilter) {
            list = localDb.images.listByProduct(prodFilter.val);
          } else {
            const db = require('./dbFallback').readDB();
            list = db.product_images;
          }
        } else if (table === 'downloads') {
          const prodFilter = this.filters.find(f => f.col === 'product_id');
          if (prodFilter) {
            list = localDb.downloads.listByProduct(prodFilter.val);
          } else {
            const db = require('./dbFallback').readDB();
            list = db.downloads;
          }
        } else if (table === 'faqs') {
          const prodFilter = this.filters.find(f => f.col === 'product_id');
          if (prodFilter) {
            list = localDb.faqs.listByProduct(prodFilter.val);
          } else {
            const db = require('./dbFallback').readDB();
            list = db.faqs;
          }
        } else if (table === 'related_products') {
          const db = require('./dbFallback').readDB();
          list = db.related_products;
        } else if (table === 'custom_products') {
          // Keep compatibility for custom_products if queried
          const db = require('./dbFallback').readDB();
          list = db.products.map((p: Record<string, unknown>) => ({
            id: p.id,
            data: p,
            created_at: p.created_at
          }));
        }

        // Apply filters
        for (const filter of this.filters) {
          if (filter.type === 'eq') {
            list = list.filter(item => item[filter.col!] === filter.val);
          } else if (filter.type === 'in') {
            const vals = filter.val as any[];
            list = list.filter(item => vals.includes(item[filter.col!]));
          } else if (filter.type === 'or') {
            const condition = String(filter.condition || '');
            const searchTerm = condition.match(/%([^%]+)%/)?.[1]?.toLowerCase() || '';
            if (searchTerm) {
              list = list.filter(item => {
                const name = String(item.name || '').toLowerCase();
                const desc = String(item.short_desc || item.long_desc || '').toLowerCase();
                return name.includes(searchTerm) || desc.includes(searchTerm);
              });
            }
          }
        }

        // Apply ordering
        if (this.orderCol) {
          const col = this.orderCol;
          const asc = this.orderAsc;
          list.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            if (valA == null) return 1;
            if (valB == null) return -1;
            if (typeof valA === 'number' && typeof valB === 'number') {
              return asc ? valA - valB : valB - valA;
            }
            return asc
              ? String(valA).localeCompare(String(valB))
              : String(valB).localeCompare(String(valA));
          });
        }

        if (this.isSingle) {
          return { data: list[0] || null, error: list[0] ? null : { message: 'Row not found' } };
        }

        return { data: list, error: null, count: list.length };
      }

      if (this.action === 'insert') {
        let inserted: any = null;
        if (table === 'categories') {
          inserted = localDb.categories.insert(this.actionData);
        } else if (table === 'products') {
          const payload = {
            ...this.actionData,
            category_id: this.actionData.category_id ?? this.actionData.category?.id ?? null,
            slug: this.actionData.slug ?? this.actionData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            applications: this.actionData.applications ?? null,
            tags: Array.isArray(this.actionData.tags) ? this.actionData.tags : (this.actionData.tags ? [this.actionData.tags] : []),
            seo_meta: this.actionData.seo_meta ?? null,
            is_hidden: this.actionData.is_hidden ?? false,
            is_featured: this.actionData.is_featured ?? false,
            sort_order: this.actionData.sort_order ?? 0,
          };
          inserted = localDb.products.insert(payload);
        } else if (table === 'variants') {
          inserted = localDb.variants.insert(this.actionData);
        } else if (table === 'part_numbers') {
          inserted = localDb.partNumbers.insert(this.actionData);
        } else if (table === 'product_images') {
          inserted = localDb.images.insert(this.actionData);
        } else if (table === 'downloads') {
          inserted = localDb.downloads.insert(this.actionData);
        } else if (table === 'faqs') {
          inserted = localDb.faqs.insert(this.actionData);
        }

        return { data: inserted, error: null };
      }

      if (this.action === 'update') {
        const slugFilter = this.filters.find(f => f.col === 'slug');
        const idFilter = this.filters.find(f => f.col === 'id');
        let updated: any = null;

        if (table === 'categories' && slugFilter) {
          updated = localDb.categories.update(slugFilter.val, this.actionData);
        } else if (table === 'products' && slugFilter) {
          updated = localDb.products.update(slugFilter.val, this.actionData);
        } else if (table === 'variants' && idFilter) {
          updated = localDb.variants.update(idFilter.val, this.actionData);
        } else if (table === 'product_images' && idFilter) {
          updated = localDb.images.update(idFilter.val, this.actionData);
        } else if (table === 'faqs' && idFilter) {
          updated = localDb.faqs.update(idFilter.val, this.actionData);
        }

        return { data: updated, error: null };
      }

      if (this.action === 'delete') {
        const slugFilter = this.filters.find(f => f.col === 'slug');
        const idFilter = this.filters.find(f => f.col === 'id');
        let success = false;

        if (table === 'categories' && slugFilter) {
          success = localDb.categories.delete(slugFilter.val);
        } else if (table === 'products' && slugFilter) {
          success = localDb.products.delete(slugFilter.val);
        } else if (table === 'variants' && idFilter) {
          success = localDb.variants.delete(idFilter.val);
        } else if (table === 'part_numbers' && idFilter) {
          success = localDb.partNumbers.delete(idFilter.val);
        } else if (table === 'product_images' && idFilter) {
          success = localDb.images.delete(idFilter.val);
        } else if (table === 'downloads' && idFilter) {
          success = localDb.downloads.delete(idFilter.val);
        } else if (table === 'faqs' && idFilter) {
          success = localDb.faqs.delete(idFilter.val);
        }

        return { data: success, error: success ? null : { message: 'Delete failed' } };
      }

      return { data: null, error: { message: 'Method not implemented' } };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Error executing query' } };
    }
  }
}

function shouldUseLocalFallback(error: any) {
  if (!error) return false;
  const message = String(error.message || error.details || '');
  return error.code === 'PGRST205' || /relation|table|does not exist|does not exist/i.test(message);
}

function wrapQueryBuilder<T extends object>(builder: T, tableName: string): T {
  return new Proxy(builder, {
    get(bTarget, bProp) {
      const value = (bTarget as any)[bProp];
      if (typeof value === 'function') {
        return (...args: any[]) => {
          const result = value.apply(bTarget, args);

          if (result && typeof result.then === 'function') {
            const originalThen = result.then.bind(result);
            (result as any).then = (onfulfilled?: any, onrejected?: any) => {
              return originalThen(async (val: any) => {
                if (val && val.error && shouldUseLocalFallback(val.error)) {
                  console.warn(`Missing table '${tableName}' in Supabase database. Switching to local fallbacks.`);
                  useLocalFallback = true;
                  const mockBuilder = new MockQueryBuilder(tableName);
                  const mockResult = await mockBuilder.select().execute();
                  return onfulfilled ? onfulfilled(mockResult) : mockResult;
                }
                return onfulfilled ? onfulfilled(val) : val;
              }, onrejected);
            };
          }

          if (result && typeof result === 'object' && result !== null) {
            const looksLikeBuilder = typeof (result as any).select === 'function' || typeof (result as any).insert === 'function' || typeof (result as any).update === 'function' || typeof (result as any).delete === 'function' || typeof (result as any).eq === 'function';
            if (looksLikeBuilder) {
              return wrapQueryBuilder(result, tableName);
            }
          }

          return result;
        };
      }
      return value;
    }
  }) as T;
}

// Proxied supabase client that automatically switches to local fallback when query fails with table-not-found
export const supabase = new Proxy(realSupabase, {
  get(target, prop) {
    if (prop === 'from') {
      return (tableName: string) => {
        if (useLocalFallback) {
          return new MockQueryBuilder(tableName) as any;
        }

        const realBuilder = target.from(tableName);
        return wrapQueryBuilder(realBuilder, tableName);
      };
    }
    return (target as any)[prop];
  }
});
