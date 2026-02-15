import { ShoppingCart, Menu, User, Package, Shield, Minus, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import type { CartItem } from '../App';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface HeaderProps {
  cart: CartItem[];
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onNavigateOrders: () => void;
  isAdmin: boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  onCheckout: () => void;
}

export default function Header({
  cart,
  onNavigateHome,
  onNavigateAdmin,
  onNavigateOrders,
  isAdmin,
  updateCartQuantity,
  removeFromCart,
  onCheckout,
}: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/new-furniture-house-wordmark.dim_900x220.png"
            alt="New Furniture House"
            className="h-8 w-auto"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" onClick={onNavigateHome} className="text-sm font-medium">
            Home
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" onClick={onNavigateOrders} className="text-sm font-medium">
              <Package className="mr-2 h-4 w-4" />
              Orders
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={onNavigateAdmin}
              className="text-sm font-semibold bg-[#FF1493] hover:bg-[#E6127F] text-white shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-xl">Cart ({cartItemCount})</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col flex-1 pt-6">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.name}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 -mt-1 -mr-2"
                                  onClick={() => removeFromCart(item.productId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold mb-2">₹{item.price.toLocaleString()}</p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="pt-4 space-y-4 border-t mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                        <span className="text-2xl font-semibold">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <Button onClick={onCheckout} className="w-full h-12 text-base font-medium" size="lg">
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Auth Button */}
          <Button
            onClick={handleAuth}
            disabled={loginStatus === 'logging-in'}
            variant={isAuthenticated ? 'ghost' : 'default'}
            className="hidden sm:flex"
          >
            <User className="mr-2 h-4 w-4" />
            {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <Button variant="ghost" onClick={onNavigateHome} className="justify-start">
                  Home
                </Button>
                {isAuthenticated && (
                  <Button variant="ghost" onClick={onNavigateOrders} className="justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    onClick={onNavigateAdmin}
                    className="justify-start bg-[#FF1493] hover:bg-[#E6127F] text-white font-semibold shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                )}
                <Separator className="my-2" />
                <Button
                  onClick={handleAuth}
                  disabled={loginStatus === 'logging-in'}
                  variant={isAuthenticated ? 'outline' : 'default'}
                  className="justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

