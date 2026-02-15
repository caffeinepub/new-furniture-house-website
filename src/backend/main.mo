import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";


import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

// Data Migration for System Upgrades - all changes from now on are automatically migrated via the migration module

actor {
  include MixinStorage();

  // State Models
  public type UserProfile = {
    name : Text;
    phone : ?Text;
    address : ?Text;
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    offer : ?Text;
    category : Text;
    images : [Storage.ExternalBlob];
    videos : [Storage.ExternalBlob];
    isActive : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Order = {
    id : Text;
    customerId : Principal;
    customerName : Text;
    phone : Text;
    address : Text;
    items : [OrderItem];
    totalPrice : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
  };

  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  public type OrderStatus = {
    #pending;
    #processing;
    #delivered;
    #cancelled;
  };

  public type StoreInfo = {
    name : Text;
    location : Text;
    hours : Text;
    rating : Float;
    reviewCount : Nat;
    googleMapsLink : Text;
    contactNumber : Text;
  };

  public type ProductStats = {
    id : Text;
    views : Nat;
    sales : Nat;
    wishlists : Nat;
  };

  func isEmptyOrWhitespace(s : Text) : Bool {
    s.chars().all(func(c) { c == ' ' or c == '\t' or c == '\n' or c == '\r' });
  };

  var storeInfo = {
    name = "New Furniture House";
    location = "Nager Bazar, Dumdum";
    hours = "Open - Closes 8 pm";
    rating = 4.7;
    reviewCount = 128;
    googleMapsLink = "https://maps.app.goo.gl/JoasKmZy64LXJcK59";
    contactNumber = "096963 74735";
  };

  let productMap = Map.empty<Text, Product>();
  let orderMap = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let productStatsMap = Map.empty<Text, ProductStats>();
  let wishlists = Map.empty<Principal, Set.Set<Text>>();
  var featuredProductIds : [Text] = [];
  let categoryMap = Map.empty<Text, Nat>();

  // Admin Authentication & Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func ensureAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admin only");
    };
  };

  func ensureUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // Category Management
  public shared ({ caller }) func addCategory(name : Text) : async () {
    ensureAdmin(caller);
    if (isEmptyOrWhitespace(name)) {
      Runtime.trap("Category name cannot be empty");
    };
    if (categoryMap.containsKey(name)) {
      Runtime.trap("Category already exists");
    };
    categoryMap.add(name, 0);
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    ensureAdmin(caller);
    if (not categoryMap.containsKey(name)) {
      Runtime.trap("Category does not exist");
    };
    let productsWithCategory : [Product] = productMap.values().toArray().filter(func(p) { p.category == name });
    if (productsWithCategory.size() > 0) {
      Runtime.trap("Cannot delete category with existing products");
    };
    categoryMap.remove(name);
  };

  public query func getAllCategories() : async [Text] {
    categoryMap.keys().toArray();
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureUser(caller);
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin)
  public shared ({ caller }) func addProduct(
    id : Text,
    name : Text,
    description : Text,
    price : Nat,
    offer : ?Text,
    category : Text,
  ) : async () {
    ensureAdmin(caller);
    if (not categoryMap.containsKey(category)) {
      Runtime.trap("Category does not exist");
    };
    let now = Time.now();
    let product : Product = {
      id;
      name;
      description;
      price;
      offer;
      category;
      images = [];
      videos = [];
      isActive = true;
      createdAt = now;
      updatedAt = now;
    };
    productMap.add(id, product);
    productStatsMap.add(id, { id; views = 0; sales = 0; wishlists = 0 });
  };

  public shared ({ caller }) func updateProduct(
    id : Text,
    name : Text,
    description : Text,
    price : Nat,
    offer : ?Text,
    category : Text,
    isActive : Bool,
  ) : async () {
    ensureAdmin(caller);
    if (not categoryMap.containsKey(category)) {
      Runtime.trap("Category does not exist");
    };
    switch (productMap.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let updated : Product = {
          id;
          name;
          description;
          price;
          offer;
          category;
          images = existing.images;
          videos = existing.videos;
          isActive;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        productMap.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func updateProductMedia(
    productId : Text,
    images : [Storage.ExternalBlob],
    videos : [Storage.ExternalBlob],
  ) : async () {
    ensureAdmin(caller);
    switch (productMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updated : Product = {
          id = product.id;
          name = product.name;
          description = product.description;
          price = product.price;
          offer = product.offer;
          category = product.category;
          images;
          videos;
          isActive = product.isActive;
          createdAt = product.createdAt;
          updatedAt = Time.now();
        };
        productMap.add(productId, updated);
      };
    };
  };

  // Product Queries
  public query func getProduct(id : Text) : async ?Product {
    productMap.get(id);
  };

  public query func getAllProducts() : async [Product] {
    productMap.values().toArray();
  };

  public query func getActiveProducts() : async [Product] {
    productMap.values().toArray().filter(func(p) { p.isActive });
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    if (not categoryMap.containsKey(category)) {
      return [];
    };
    productMap.values().toArray().filter(func(p) { p.isActive and p.category == category });
  };

  // Cart & Order Management
  public shared ({ caller }) func createOrder(
    id : Text,
    name : Text,
    phone : Text,
    address : Text,
    cart : [CartItem],
  ) : async () {
    ensureUser(caller);

    let orderItems = cart.map(func(cartItem) {
      switch (productMap.get(cartItem.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) {
          {
            productId = cartItem.productId;
            quantity = cartItem.quantity;
            price = product.price;
          };
        };
      };
    });

    let total = orderItems.map(func(item) { item.price * item.quantity }).foldLeft(0, Nat.add);

    let order : Order = {
      id;
      customerId = caller;
      customerName = name;
      phone;
      address;
      items = orderItems;
      totalPrice = total;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    orderMap.add(id, order);

    orderItems.forEach(func(item) {
      switch (productStatsMap.get(item.productId)) {
        case (null) {};
        case (?stats) {
          productStatsMap.add(item.productId, { stats with sales = stats.sales + item.quantity });
        };
      };
    });
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    ensureAdmin(caller);
    switch (orderMap.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updated : Order = {
          order with status;
          updatedAt = Time.now();
        };
        orderMap.add(orderId, updated);
      };
    };
  };

  public query ({ caller }) func getOrder(id : Text) : async Order {
    switch (orderMap.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    ensureAdmin(caller);
    orderMap.values().toArray();
  };

  public query ({ caller }) func getActiveOrders() : async [Order] {
    ensureAdmin(caller);
    orderMap.values().toArray().filter(func(order) { order.status == #pending or order.status == #processing });
  };

  public query ({ caller }) func getCompletedOrders() : async [Order] {
    ensureAdmin(caller);
    orderMap.values().toArray().filter(func(order) { order.status == #delivered or order.status == #cancelled });
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    orderMap.values().toArray().filter(func(order) { order.customerId == caller });
  };

  // Store Info
  public query func getStoreInfo() : async StoreInfo {
    storeInfo;
  };

  // Product Stats & Analytics
  public query func getProductStats(id : Text) : async ?ProductStats {
    productStatsMap.get(id);
  };

  public query ({ caller }) func getAllProductStats() : async [ProductStats] {
    ensureAdmin(caller);
    productStatsMap.values().toArray();
  };

  public shared ({ caller }) func incrementProductViews(productId : Text) : async () {
    ensureUser(caller);
    switch (productStatsMap.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?stats) {
        productStatsMap.add(
          productId,
          { stats with views = stats.views + 1 },
        );
      };
    };
  };

  // User Interactions & Wishlist
  public shared ({ caller }) func addToWishlist(productId : Text) : async () {
    ensureUser(caller);
    let userWishlist = switch (wishlists.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?w) { w };
    };

    if (not userWishlist.contains(productId)) {
      userWishlist.add(productId);
      wishlists.add(caller, userWishlist);

      switch (productStatsMap.get(productId)) {
        case (null) {};
        case (?stats) {
          productStatsMap.add(productId, { stats with wishlists = stats.wishlists + 1 });
        };
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Text) : async () {
    ensureUser(caller);
    switch (wishlists.get(caller)) {
      case (null) { Runtime.trap("Product not in wishlist") };
      case (?userWishlist) {
        if (not userWishlist.contains(productId)) {
          Runtime.trap("Product not in wishlist");
        } else {
          userWishlist.remove(productId);
          switch (productStatsMap.get(productId)) {
            case (null) {};
            case (?stats) {
              productStatsMap.add(
                productId,
                {
                  stats with wishlists =
                  if (stats.wishlists > 0) { stats.wishlists - 1 } else {
                    stats.wishlists;
                  };
                },
              );
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getWishlist() : async [Text] {
    switch (wishlists.get(caller)) {
      case (null) { [] };
      case (?wishlist) { wishlist.toArray() };
    };
  };

  // Featured Products (Admin)
  public shared ({ caller }) func setFeaturedProducts(ids : [Text]) : async () {
    ensureAdmin(caller);
    featuredProductIds := ids;
  };

  public query func getFeaturedProducts() : async [Product] {
    featuredProductIds.map(func(id) {
      switch (productMap.get(id)) {
        case (null) { Runtime.trap("Featured product not found") };
        case (?product) { product };
      };
    });
  };

  // System Stats & Analytics (Admin)
  public query ({ caller }) func getSystemStats() : async {
    totalProducts : Nat;
    totalOrders : Nat;
    totalSales : Nat;
    activeProducts : Nat;
    pendingOrders : Nat;
  } {
    ensureAdmin(caller);

    let totalProducts = productMap.size();
    let totalOrders = orderMap.size();
    let totalSales = orderMap.values().toArray().map(func(order) { order.totalPrice }).foldLeft(0, Nat.add);
    let activeProducts = productMap.values().toArray().filter(func(p) { p.isActive }).size();
    let pendingOrders = orderMap.values().toArray().filter(func(order) { order.status == #pending }).size();

    {
      totalProducts;
      totalOrders;
      totalSales;
      activeProducts;
      pendingOrders;
    };
  };
};
