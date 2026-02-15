import { useState } from 'react';
import { MapPin, Phone, Star, Clock, Navigation } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGetActiveProducts, useGetStoreInfo, useGetAllCategories } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import type { CartItem } from '../App';
import CategoryStrip from '../components/storefront/CategoryStrip';
import ProductCard from '../components/storefront/ProductCard';

interface HomePageProps {
  onViewProduct: (productId: string) => void;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

export default function HomePage({ onViewProduct, onAddToCart, onBuyNow }: HomePageProps) {
  const { data: products, isLoading: productsLoading } = useGetActiveProducts();
  const { data: storeInfo } = useGetStoreInfo();
  const { data: categories } = useGetAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    const imageUrl = product.images[0]?.getDirectURL() || '/assets/generated/sample-sofa.dim_800x600.jpg';
    onAddToCart({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: Number(product.price),
      imageUrl,
    });
  };

  const handleBuyNow = (product: any) => {
    const imageUrl = product.images[0]?.getDirectURL() || '/assets/generated/sample-sofa.dim_800x600.jpg';
    onBuyNow({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: Number(product.price),
      imageUrl,
    });
  };

  // Normalize category for consistent comparison
  const normalizeCategory = (category: string | undefined | null): string => {
    if (!category || category.trim() === '') return 'Uncategorized';
    return category.trim().toLowerCase();
  };

  // Filter products by category using real product.category field
  const filteredProducts = products?.filter((product) => {
    if (!selectedCategory) return true;
    return normalizeCategory(product.category) === normalizeCategory(selectedCategory);
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/mobel-hero-bg.dim_1920x900.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="relative container h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Furniture
              <br />
              <span className="text-muted-foreground">for Your Dream Home</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Discover timeless designs and exceptional craftsmanship at New Furniture House, Nager Bazar.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={storeInfo?.googleMapsLink || '#'} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-8">
                  <Navigation className="mr-2 h-5 w-5" />
                  Get Directions
                </Button>
              </a>
              <a href={`tel:${storeInfo?.contactNumber || ''}`}>
                <Button size="lg" variant="outline" className="h-12 px-8">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Store Info Bar */}
      <section className="border-b bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">Location</p>
                <p className="text-sm text-muted-foreground">{storeInfo?.location || 'Nager Bazar, Dumdum'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">Hours</p>
                <p className="text-sm text-muted-foreground">{storeInfo?.hours || 'Open - Closes 8 pm'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">Rating</p>
                <p className="text-sm text-muted-foreground">
                  {storeInfo?.rating || '4.7'} ({storeInfo?.reviewCount?.toString() || '128'} reviews)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of furniture designed to transform your living spaces
            </p>
          </div>
          <CategoryStrip
            categories={categories || []}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-muted/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {selectedCategory ? `${selectedCategory}` : 'Featured Collection'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {selectedCategory
                ? `Browse our selection of premium ${selectedCategory.toLowerCase()}`
                : 'Handpicked pieces that combine style, comfort, and quality craftsmanship'}
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded overflow-hidden bg-card">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const imageUrl = product.images[0]?.getDirectURL() || '/assets/generated/sample-sofa.dim_800x600.jpg';
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={Number(product.price)}
                    offer={product.offer || undefined}
                    imageUrl={imageUrl}
                    onView={() => onViewProduct(product.id)}
                    onAddToCart={() => handleAddToCart(product)}
                    onBuyNow={() => handleBuyNow(product)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {selectedCategory
                  ? `No ${selectedCategory.toLowerCase()} available at the moment.`
                  : 'No products available at the moment.'}
              </p>
              {selectedCategory && (
                <Button variant="outline" className="mt-4" onClick={() => setSelectedCategory(null)}>
                  View All Products
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Our Showroom</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience our furniture collection in person at our Nager Bazar location
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video rounded overflow-hidden border shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.0234567890123!2d88.41234567890123!3d22.65432109876543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM5JzE1LjYiTiA4OMKwMjQnNDQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="New Furniture House Location"
              />
            </div>
            <div className="mt-8 text-center">
              <a href={storeInfo?.googleMapsLink || '#'} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  <Navigation className="mr-2 h-5 w-5" />
                  Open in Google Maps
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
