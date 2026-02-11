import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ProductCard, Product } from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Catalog = () => {
    const [searchTerm, setSearchTerm] = useState("");
    // In a real implementation, we would fetch from DB
    // But since the migration might not have run, we'll implement the fetch 
    // and handle potential errors or empty states gracefully.

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            // We might need to select specific columns or just all
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .select('*');

            if (error) {
                console.error("Error fetching products:", error);
                // Fallback for demo purposes if table doesn't exist yet
                // In reality, we should show an error
                return [];
            }
            return data as Product[];
        }
    });

    // Filter products client-side for simplicity in this demo
    // Filter products client-side for simplicity in this demo
    const filteredProducts = products?.filter(product =>
        (product.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (product.technology?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catálogo de Simulados</h1>
                    <p className="text-muted-foreground mt-1">
                        Encontre o simulado ideal para sua certificação.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome, tecnologia..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-destructive">Erro ao carregar produtos.</h3>
                    <p className="text-muted-foreground">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
                </div>
            ) : !products || products.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
                    <p className="text-muted-foreground mb-6">
                        O banco de dados parece estar vazio. Execute o script de seed no Supabase.
                    </p>
                </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <h3 className="text-xl font-semibold mb-2">Nenhum simulado encontrado</h3>
                    <p className="text-muted-foreground mb-6">
                        Não encontramos resultados para "{searchTerm}". Tente outros termos.
                    </p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Limpar Filtros
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Catalog;
