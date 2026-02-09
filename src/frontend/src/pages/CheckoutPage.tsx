import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { useCreateOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { CartItem } from '../App';

interface CheckoutPageProps {
  cart: CartItem[];
  onOrderComplete: () => void;
  onBack: () => void;
}

export default function CheckoutPage({ cart, onOrderComplete, onBack }: CheckoutPageProps) {
  const { identity } = useInternetIdentity();
  const createOrder = useCreateOrder();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!identity) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const cartItems = cart.map((item) => ({
        productId: item.productId,
        quantity: BigInt(item.quantity),
      }));

      await createOrder.mutateAsync({
        id: orderId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        cart: cartItems,
      });

      toast.success('Order placed successfully! We will contact you soon.');
      onOrderComplete();
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-12">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
          <Button onClick={onBack} size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container py-12 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold">
                      Delivery Address *
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete delivery address with landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-6 rounded space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Payment Method</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary font-semibold">✓</span> Pay on Delivery (Cash/UPI)
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You can pay when your order is delivered to your doorstep.
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={createOrder.isPending}>
                    {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate leading-tight mb-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">₹{cartTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

