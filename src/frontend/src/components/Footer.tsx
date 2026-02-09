import { Heart, Home, Package, Shield } from 'lucide-react';
import { Button } from './ui/button';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onNavigateAdmin: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export default function Footer({
  onNavigateHome,
  onNavigateOrders,
  onNavigateAdmin,
  isAdmin,
  isAuthenticated,
}: FooterProps) {
  return (
    <footer className="border-t bg-muted/20 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">New Furniture House</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium furniture for your dream home. Quality assured, delivered with care.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Location</h3>
            <p className="text-sm text-muted-foreground">Nager Bazar, Dumdum</p>
            <p className="text-sm text-muted-foreground">Open - Closes 8 pm</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h3>
            <p className="text-sm text-muted-foreground">Phone: 096963 74735</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Sitemap</h3>
            <nav className="flex flex-col gap-2">
              <Button
                variant="link"
                className="justify-start h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={onNavigateHome}
              >
                <Home className="mr-2 h-3.5 w-3.5" />
                Home
              </Button>
              {isAuthenticated && (
                <Button
                  variant="link"
                  className="justify-start h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={onNavigateOrders}
                >
                  <Package className="mr-2 h-3.5 w-3.5" />
                  My Orders
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="link"
                  className="justify-start h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={onNavigateAdmin}
                >
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Admin Panel
                </Button>
              )}
            </nav>
          </div>
        </div>
        <div className="pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            © 2026. Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
