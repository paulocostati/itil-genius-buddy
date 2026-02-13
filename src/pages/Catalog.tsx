import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ProductCard, Product } from "@/components/ProductCard";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface VendorWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    products: Product[];
  }[];
}

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['catalog-vendors'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('vendors')
        .select('id, name, slug, description, categories(id, name, slug, products(*))') 
        .order('name');
      if (error) throw error;
      return (data || []) as VendorWithProducts[];
    }
  });

  // Flatten and filter products for search
  const allProducts = vendors?.flatMap(v =>
    v.categories.flatMap(c =>
      (c.products || []).map(p => ({ ...p, vendorName: v.name, categoryName: c.name }))
    )
  ) || [];

  const filtered = searchTerm
    ? allProducts.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Simulados</h1>
          <p className="text-muted-foreground mt-1">Encontre o simulado ideal para sua certificação.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar por nome, fornecedor..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-destructive">Erro ao carregar produtos.</h3>
        </div>
      ) : filtered ? (
        // Search results mode
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
            <h3 className="text-xl font-semibold mb-2">Nenhum simulado encontrado</h3>
            <p className="text-muted-foreground mb-6">Não encontramos resultados para "{searchTerm}".</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>Limpar Filtros</Button>
          </div>
        )
      ) : vendors && vendors.length > 0 ? (
        // Grouped by vendor mode
        <div className="space-y-10">
          {vendors.map(vendor => {
            const vendorProducts = vendor.categories.flatMap(c => c.products || []);
            if (vendorProducts.length === 0) return null;
            return (
              <section key={vendor.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{vendor.name}</h2>
                  <Badge variant="secondary">{vendorProducts.length} simulado{vendorProducts.length !== 1 ? 's' : ''}</Badge>
                </div>
                {vendor.description && <p className="text-muted-foreground mb-4">{vendor.description}</p>}
                {vendor.categories.map(cat => {
                  if (!cat.products || cat.products.length === 0) return null;
                  return (
                    <div key={cat.id} className="mb-6">
                      {vendor.categories.length > 1 && (
                        <h3 className="text-lg font-semibold text-muted-foreground mb-3">{cat.name}</h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cat.products.map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground">Adicione fornecedores, categorias e produtos no painel admin.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
