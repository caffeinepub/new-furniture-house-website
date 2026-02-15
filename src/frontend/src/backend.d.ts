import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface OrderItem {
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    createdAt: Time;
    updatedAt: Time;
    address: string;
    customerId: Principal;
    phone: string;
    items: Array<OrderItem>;
    totalPrice: bigint;
}
export interface ProductStats {
    id: string;
    views: bigint;
    wishlists: bigint;
    sales: bigint;
}
export interface StoreInfo {
    hours: string;
    name: string;
    googleMapsLink: string;
    contactNumber: string;
    rating: number;
    reviewCount: bigint;
    location: string;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Product {
    id: string;
    offer?: string;
    name: string;
    createdAt: Time;
    description: string;
    isActive: boolean;
    updatedAt: Time;
    category: string;
    price: bigint;
    videos: Array<ExternalBlob>;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
    address?: string;
    phone?: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    addProduct(id: string, name: string, description: string, price: bigint, offer: string | null, category: string): Promise<void>;
    addToWishlist(productId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(id: string, name: string, phone: string, address: string, cart: Array<CartItem>): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    getActiveOrders(): Promise<Array<Order>>;
    getActiveProducts(): Promise<Array<Product>>;
    getAllCategories(): Promise<Array<string>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProductStats(): Promise<Array<ProductStats>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedOrders(): Promise<Array<Order>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(id: string): Promise<Order>;
    getProduct(id: string): Promise<Product | null>;
    getProductStats(id: string): Promise<ProductStats | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getStoreInfo(): Promise<StoreInfo>;
    getSystemStats(): Promise<{
        totalProducts: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        totalSales: bigint;
        activeProducts: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWishlist(): Promise<Array<string>>;
    incrementProductViews(productId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeFromWishlist(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setFeaturedProducts(ids: Array<string>): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(id: string, name: string, description: string, price: bigint, offer: string | null, category: string, isActive: boolean): Promise<void>;
    updateProductMedia(productId: string, images: Array<ExternalBlob>, videos: Array<ExternalBlob>): Promise<void>;
}
