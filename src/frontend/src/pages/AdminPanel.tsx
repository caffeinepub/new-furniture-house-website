import { useState } from 'react';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  useGetAllProducts,
  useAddProduct,
  useUpdateProduct,
  useUpdateProductMedia,
  useGetAllOrders,
  useUpdateOrderStatus,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import { ExternalBlob, OrderStatus } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container py-12 max-w-7xl">
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-12">Admin Panel</h1>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { data: products, isLoading } = useGetAllProducts();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Products</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Product</DialogTitle>
            </DialogHeader>
            <AddProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : products && products.length > 0 ? (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap mb-2">
                      <span>{product.name}</span>
                      {!product.isActive && <Badge variant="secondary">Inactive</Badge>}
                      {product.offer && <Badge variant="destructive">{product.offer}</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedProduct(product)}>
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{product.description}</p>
                    <p className="text-2xl font-bold">₹{Number(product.price).toLocaleString()}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      Images: {product.images.length} | Videos: {product.videos.length}
                    </p>
                    {product.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {product.images.slice(0, 4).map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={img.getDirectURL()}
                            alt=""
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products yet. Add your first product!</p>
        </div>
      )}

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Product</DialogTitle>
            </DialogHeader>
            <EditProductForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddProductForm() {
  const addProduct = useAddProduct();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offer: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all required fields (Name, Description, Price)');
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await addProduct.mutateAsync({
        id: productId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: BigInt(Math.round(priceValue)),
        offer: formData.offer.trim() || null,
      });

      toast.success('Product added successfully! You can now upload images.');
      setFormData({ name: '', description: '', price: '', offer: '' });
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">
          Product Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Modern Sofa Set"
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the product features, materials, dimensions..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-semibold">
            Price (₹) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., 25000"
            className="h-11"
            min="0"
            step="1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer" className="text-sm font-semibold">
            Offer <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <Input
            id="offer"
            value={formData.offer}
            onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
            placeholder="e.g., 20% OFF"
            className="h-11"
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <ImageIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>After creating the product, you can upload images and videos by clicking "Edit" on the product card.</span>
        </p>
      </div>

      <Button type="submit" className="w-full h-11" disabled={addProduct.isPending}>
        {addProduct.isPending ? 'Adding Product...' : 'Add Product'}
      </Button>
    </form>
  );
}

function EditProductForm({ product, onClose }: { product: any; onClose: () => void }) {
  const updateProduct = useUpdateProduct();
  const updateMedia = useUpdateProductMedia();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: Number(product.price).toString(),
    offer: product.offer || '',
    isActive: product.isActive,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: BigInt(Math.round(priceValue)),
        offer: formData.offer.trim() || null,
        isActive: formData.isActive,
      });

      toast.success('Product updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages: ExternalBlob[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          const overallProgress = ((i / imageFiles.length) * 100) + (percentage / imageFiles.length);
          setUploadProgress(Math.round(overallProgress));
        });
        newImages.push(blob);
      }

      const updatedImages = [...product.images, ...newImages];
      await updateMedia.mutateAsync({
        productId: product.id,
        images: updatedImages,
        videos: product.videos,
      });

      toast.success(`${imageFiles.length} image(s) uploaded successfully!`);
      setUploadProgress(0);
      setIsUploading(false);
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to upload images');
      console.error(error);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const updatedVideos = [...product.videos, blob];
      await updateMedia.mutateAsync({
        productId: product.id,
        images: product.images,
        videos: updatedVideos,
      });

      toast.success('Video uploaded successfully!');
      setUploadProgress(0);
      setIsUploading(false);
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to upload video');
      console.error(error);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-sm font-semibold">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description" className="text-sm font-semibold">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-sm font-semibold">
              Price (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="h-11"
              min="0"
              step="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-offer" className="text-sm font-semibold">
              Offer <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="edit-offer"
              value={formData.offer}
              onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
              className="h-11"
              placeholder="e.g., 20% OFF"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="edit-active" className="text-sm font-semibold">
            Product Active
          </Label>
          <Switch
            id="edit-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">Upload Product Images</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="cursor-pointer h-11"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isUploading}
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select multiple images to upload at once. Supported formats: JPG, PNG, WebP
            </p>
          </div>
          {product.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((img: any, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.getDirectURL()}
                    alt=""
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <span className="text-white text-xs">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Upload Product Videos</Label>
          <div className="space-y-3">
            <Input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isUploading}
              className="cursor-pointer h-11"
            />
            <p className="text-xs text-muted-foreground">
              Upload product demonstration videos. Supported formats: MP4, WebM
            </p>
          </div>
          {product.videos.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">{product.videos.length} video(s) uploaded</p>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Upload Progress</Label>
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <Separator />

      <Button type="submit" className="w-full h-11" disabled={updateProduct.isPending || isUploading}>
        {updateProduct.isPending ? 'Updating Product...' : 'Update Product'}
      </Button>
    </form>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, statusValue: string) => {
    try {
      let status: OrderStatus;
      
      switch (statusValue) {
        case 'pending':
          status = OrderStatus.pending;
          break;
        case 'processing':
          status = OrderStatus.processing;
          break;
        case 'delivered':
          status = OrderStatus.delivered;
          break;
        case 'cancelled':
          status = OrderStatus.cancelled;
          break;
        default:
          toast.error('Invalid status');
          return;
      }

      await updateStatus.mutateAsync({
        orderId,
        status,
      });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manage Orders</h2>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">Customer: {order.customerName}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider">Contact Information</h4>
                    <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">Address: {order.address}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider">Order Details</h4>
                    <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                    <p className="text-2xl font-bold">₹{Number(order.totalPrice).toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Items</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground flex justify-between py-1">
                      <span>
                        {item.productId.slice(0, 30)}... (Qty: {item.quantity.toString()})
                      </span>
                      <span className="font-medium">₹{Number(item.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Label className="text-sm font-semibold">Update Status:</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
