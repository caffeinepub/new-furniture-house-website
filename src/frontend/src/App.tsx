import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { useHashRoute } from './hooks/useHashRoute';
import { navigateToRoute } from './utils/hashRoutes';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import AdminAccessBlockedPage from './pages/AdminAccessBlockedPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
};

function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const route = useHashRoute();
  
  const [cart, setCart] = useState<CartItem[]>([]);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prevCart.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const viewProduct = (productId: string) => {
    navigateToRoute({ type: 'product', productId });
  };

  const navigateToCheckout = () => {
    navigateToRoute({ type: 'checkout' });
  };

  const navigateToHome = () => {
    navigateToRoute({ type: 'home' });
  };

  const navigateToAdmin = () => {
    navigateToRoute({ type: 'admin' });
  };

  const navigateToOrders = () => {
    navigateToRoute({ type: 'orders' });
  };

  // Render the appropriate view based on the current route
  const renderView = () => {
    switch (route.type) {
      case 'home':
        return (
          <HomePage
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            onBuyNow={(item) => {
              addToCart(item);
              navigateToCheckout();
            }}
          />
        );

      case 'product':
        return (
          <ProductDetailPage
            productId={route.productId}
            onAddToCart={addToCart}
            onBuyNow={(item) => {
              addToCart(item);
              navigateToCheckout();
            }}
            onBack={navigateToHome}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            cart={cart}
            onOrderComplete={() => {
              clearCart();
              navigateToHome();
            }}
            onBack={navigateToHome}
          />
        );

      case 'orders':
        return <MyOrdersPage onBack={navigateToHome} />;

      case 'admin':
        // Check admin access
        if (!isAdminLoading) {
          if (isAuthenticated && isAdmin) {
            return <AdminPanel onBack={navigateToHome} />;
          } else {
            return <AdminAccessBlockedPage onNavigateHome={navigateToHome} isAuthenticated={isAuthenticated} />;
          }
        }
        // While loading admin status, show nothing (will be quick)
        return null;

      case 'not-found':
        return <NotFoundPage onNavigateHome={navigateToHome} />;

      default:
        return <NotFoundPage onNavigateHome={navigateToHome} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          cart={cart}
          onNavigateHome={navigateToHome}
          onNavigateAdmin={navigateToAdmin}
          onNavigateOrders={navigateToOrders}
          isAdmin={isAdmin || false}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          onCheckout={navigateToCheckout}
        />

        <main className="flex-1">
          {renderView()}
        </main>

        <Footer
          onNavigateHome={navigateToHome}
          onNavigateOrders={navigateToOrders}
          onNavigateAdmin={navigateToAdmin}
          isAdmin={isAdmin || false}
          isAuthenticated={isAuthenticated}
        />

        {showProfileSetup && <ProfileSetupModal />}

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
