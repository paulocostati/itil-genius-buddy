import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HelpCircle, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export interface Product {
    id: string;
    slug: string;
    title: string;
    technology: string | null;
    level: string | null;
    question_count?: number | null;
    duration_minutes: number | null;
    price_cents: number;
    cover_image?: string | null;
    description: string | null;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(cents / 100);
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden border-border/50">
            <div className="h-40 bg-muted flex items-center justify-center relative group overflow-hidden p-2">
                {product.cover_image ? (
                    <img
                        src={product.cover_image}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Layers className="h-16 w-16 text-muted-foreground/30" />
                )}
            </div>

            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold leading-tight line-clamp-2 h-14">
                    <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors">
                        {product.title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    {product.question_count && (
                        <div className="flex items-center gap-1">
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>{product.question_count} questões</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{product.duration_minutes || 60} min</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t bg-muted/20 mt-auto">
                <div className="flex items-center justify-between w-full mt-4">
                    <span className="text-xl font-bold text-primary">
                        {formatPrice(product.price_cents)}
                    </span>
                    <Button size="sm" asChild>
                        <Link to={`/product/${product.slug}`}>
                            Detalhes
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
