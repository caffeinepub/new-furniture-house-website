import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useGetMyOrders } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Separator } from '../components/ui/separator';

interface MyOrdersPageProps {
  onBack: () => void;
}

export default function MyOrdersPage({ onBack }: MyOrdersPageProps) {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetMyOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'processing':
        return 'bg-blue-500 hover:bg-blue-500';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-500';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-500';
      default:
        return 'bg-gray-500 hover:bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!identity) {
    return (
      <div className="container py-12">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">Please login to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container py-12 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-12">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">Order #{order.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item(s) • ₹{Number(order.totalPrice).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm uppercase tracking-wider">Delivery Address</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{order.address}</p>
                      <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm uppercase tracking-wider">Order Items</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex justify-between">
                            <span>
                              {item.productId.slice(0, 20)}... (Qty: {item.quantity.toString()})
                            </span>
                            <span className="font-medium">₹{Number(item.price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-6">Start shopping to place your first order!</p>
            <Button onClick={onBack} size="lg">
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

