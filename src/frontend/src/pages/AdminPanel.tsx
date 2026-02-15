import { useState } from 'react';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
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
  useGetAllCategories,
  useAddCategory,
  useDeleteCategory,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import { ExternalBlob, OrderStatus } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

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

  const normalizeCategory = (category: string | undefined | null): string => {
    if (!category || category.trim() === '') return 'Uncategorized';
    return category;
  };

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
                      <Badge variant="outline">{normalizeCategory(product.category)}</Badge>
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
  const { data: categories } = useGetAllCategories();
  const addCategory = useAddCategory();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offer: '',
    category: '',
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await addCategory.mutateAsync(newCategoryName.trim());
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('Category added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields (Name, Description, Price, Category)');
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
        category: formData.category,
      });

      toast.success('Product added successfully! You can now upload images and videos.');
      setFormData({ name: '', description: '', price: '', offer: '', category: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product');
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

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-semibold">
          Category <span className="text-destructive">*</span>
        </Label>
        {!showNewCategory ? (
          <div className="flex gap-2">
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                )}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="h-11"
            />
            <Button type="button" onClick={handleAddCategory} disabled={addCategory.isPending}>
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
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
          <span>
            After creating the product, you can upload images and videos by clicking "Edit" on the product card.
          </span>
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
  const { data: categories } = useGetAllCategories();
  const addCategory = useAddCategory();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: Number(product.price).toString(),
    offer: product.offer || '',
    category: product.category || '',
    isActive: product.isActive,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await addCategory.mutateAsync(newCategoryName.trim());
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('Category added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category) {
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
        category: formData.category,
        isActive: formData.isActive,
      });

      toast.success('Product updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
      console.error(error);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newBlobs: ExternalBlob[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          const fileProgress = (i / totalFiles) * 100 + percentage / totalFiles;
          setUploadProgress(Math.round(fileProgress));
        });
        newBlobs.push(blob);
      }

      const currentImages = type === 'image' ? [...product.images, ...newBlobs] : product.images;
      const currentVideos = type === 'video' ? [...product.videos, ...newBlobs] : product.videos;

      await updateMedia.mutateAsync({
        productId: product.id,
        images: currentImages,
        videos: currentVideos,
      });

      toast.success(`${type === 'image' ? 'Images' : 'Videos'} uploaded successfully`);
      setUploadProgress(0);
    } catch (error) {
      toast.error(`Failed to upload ${type === 'image' ? 'images' : 'videos'}`);
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = async (index: number, type: 'image' | 'video') => {
    try {
      const newImages = type === 'image' ? product.images.filter((_: any, i: number) => i !== index) : product.images;
      const newVideos = type === 'video' ? product.videos.filter((_: any, i: number) => i !== index) : product.videos;

      await updateMedia.mutateAsync({
        productId: product.id,
        images: newImages,
        videos: newVideos,
      });

      toast.success(`${type === 'image' ? 'Image' : 'Video'} removed successfully`);
    } catch (error) {
      toast.error(`Failed to remove ${type === 'image' ? 'image' : 'video'}`);
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="edit-name" className="text-sm font-semibold">
          Product Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Modern Sofa Set"
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
          placeholder="Describe the product features, materials, dimensions..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-category" className="text-sm font-semibold">
          Category <span className="text-destructive">*</span>
        </Label>
        {!showNewCategory ? (
          <div className="flex gap-2">
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                )}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="h-11"
            />
            <Button type="button" onClick={handleAddCategory} disabled={addCategory.isPending}>
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
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
            placeholder="e.g., 25000"
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
            placeholder="e.g., 20% OFF"
            className="h-11"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded">
        <div>
          <Label htmlFor="edit-active" className="text-sm font-semibold">
            Product Status
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.isActive ? 'Visible to customers' : 'Hidden from storefront'}
          </p>
        </div>
        <Switch
          id="edit-active"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <Separator />

      {/* Media Upload Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Media (Images & Videos)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload product images and videos to showcase your furniture. Images help customers see details, while videos
            can demonstrate features and quality.
          </p>
        </div>

        {/* Images Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Product Images
            </Label>
            <label htmlFor="image-upload">
              <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </span>
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'image')}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {product.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img: any, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.getDirectURL()}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMedia(idx, 'image')}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded p-8 text-center text-sm text-muted-foreground">
              No images uploaded yet. Click "Upload Images" to add product photos.
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Video className="h-4 w-4" />
              Product Videos
            </Label>
            <label htmlFor="video-upload">
              <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </span>
              </Button>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={(e) => handleMediaUpload(e, 'video')}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {product.videos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {product.videos.map((vid: any, idx: number) => (
                <div key={idx} className="relative group">
                  <video src={vid.getDirectURL()} className="w-full h-32 object-cover rounded border" controls />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMedia(idx, 'video')}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded p-8 text-center text-sm text-muted-foreground">
              No videos uploaded yet. Click "Upload Video" to add a product video.
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 h-11" disabled={updateProduct.isPending || isUploading}>
          {updateProduct.isPending ? 'Saving Changes...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="h-11" disabled={isUploading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case OrderStatus.pending:
        return 'secondary';
      case OrderStatus.processing:
        return 'default';
      case OrderStatus.delivered:
        return 'outline';
      case OrderStatus.cancelled:
        return 'destructive';
      default:
        return 'default';
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
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <span>Order #{order.id.slice(-8)}</span>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(order.createdAt) / 1000000).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                      <SelectItem value={OrderStatus.processing}>Processing</SelectItem>
                      <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                      <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Customer</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-2">Items ({order.items.length})</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productId} × {item.quantity.toString()}
                        </span>
                        <span className="font-medium">₹{Number(item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">₹{Number(order.totalPrice).toLocaleString()}</span>
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
