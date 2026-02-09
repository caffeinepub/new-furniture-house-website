import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Play, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useGetProduct, useIncrementProductViews } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import type { CartItem } from '../App';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ProductDetailPageProps {
  productId: string;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onBack: () => void;
}

export default function ProductDetailPage({ productId, onAddToCart, onBuyNow, onBack }: ProductDetailPageProps) {
  const { data: product, isLoading } = useGetProduct(productId);
  const { identity } = useInternetIdentity();
  const incrementViews = useIncrementProductViews();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');

  // Track product view when component mounts or productId changes
  useEffect(() => {
    if (product && identity && !incrementViews.isPending) {
      incrementViews.mutate(productId);
    }
  }, [productId, product, identity]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-center text-muted-foreground text-lg">Product not found</p>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [];
  const videos = product.videos || [];
  const currentImageUrl =
    images[selectedImageIndex]?.getDirectURL() || '/assets/generated/sample-sofa.dim_800x600.jpg';

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      quantity,
      name: product.name,
      price: Number(product.price),
      imageUrl: currentImageUrl,
    });
  };

  const handleBuyNow = () => {
    onBuyNow({
      productId: product.id,
      quantity,
      name: product.name,
      price: Number(product.price),
      imageUrl: currentImageUrl,
    });
  };

  const openVideoDialog = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setVideoDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded border bg-muted">
              <img src={currentImageUrl} alt={product.name} className="w-full h-auto object-cover" />
              {product.offer && (
                <Badge className="absolute top-4 right-4 bg-destructive hover:bg-destructive text-destructive-foreground font-semibold text-base px-4 py-2">
                  {product.offer}
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`border-2 rounded overflow-hidden transition-all ${
                      selectedImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/20'
                    }`}
                  >
                    <img src={image.getDirectURL()} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Thumbnails */}
            {videos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider">Product Videos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => openVideoDialog(video.getDirectURL())}
                      className="relative border-2 rounded overflow-hidden hover:border-primary transition-all group"
                    >
                      <video src={video.getDirectURL()} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
              <p className="text-4xl font-bold">₹{Number(product.price).toLocaleString()}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" size="lg" className="flex-1 h-12" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" className="flex-1 h-12" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            {/* Additional Info */}
            <Card className="bg-muted/50 border-0">
              <CardContent className="p-6 space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span> Pay on Delivery Available
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span> Free Delivery in Dumdum Area
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span> Quality Assured Furniture
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <video src={selectedVideoUrl} controls autoPlay className="w-full rounded" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
