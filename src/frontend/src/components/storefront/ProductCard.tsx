import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  offer?: string;
  imageUrl: string;
  onView: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductCard({
  name,
  description,
  price,
  offer,
  imageUrl,
  onView,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300">
      <button onClick={onView} className="relative w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {offer && (
          <Badge className="absolute top-3 right-3 bg-destructive hover:bg-destructive text-destructive-foreground font-semibold">
            {offer}
          </Badge>
        )}
      </button>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{description}</p>
        <p className="text-2xl font-bold">₹{price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
        <Button size="sm" className="flex-1" onClick={onBuyNow}>
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}

