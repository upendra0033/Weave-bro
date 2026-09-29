// Weave Bro - Store & State Management
// Handles LocalStorage sync, Cart, Wishlist, Orders, Promos, and Admin CRUD operations

class StoreManager {
  constructor() {
    this.STORAGE_KEYS = {
      PRODUCTS: "weavebro_products_v1",
      SETTINGS: "weavebro_settings_v1",
      PROMOS: "weavebro_promos_v1",
      CART: "weavebro_cart_v1",
      WISHLIST: "weavebro_wishlist_v1",
      ORDERS: "weavebro_orders_v1",
      CURRENT_USER: "weavebro_user_v1",
      USERS: "weavebro_users_v1"
    };

    this.subscribers = [];
    this.activeOtpSession = null;
    this.init();
  }

  init() {
    this.products = this.load(this.STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.settings = this.load(this.STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
    this.promos = this.load(this.STORAGE_KEYS.PROMOS, INITIAL_PROMO_CODES);
    this.cart = this.load(this.STORAGE_KEYS.CART, []);
    this.wishlist = this.load(this.STORAGE_KEYS.WISHLIST, []);
    this.currentUser = this.load(this.STORAGE_KEYS.CURRENT_USER, null);
    this.users = this.load(this.STORAGE_KEYS.USERS, [
      {
        id: "usr-demo",
        name: "Kabir Roy",
        phone: "9820112345",
        email: "kabir@example.com",
        city: "Mumbai",
        address: "Flat 402, Sea Crest Apts, Bandra West, Mumbai - 400050",
        pincode: "400050",
        joinedDate: "2026-09-20"
      }
    ]);
    this.orders = this.load(this.STORAGE_KEYS.ORDERS, [
      {
        id: "WB-9821",
        date: "2026-09-27",
        customer: { name: "Kabir Roy", email: "kabir@example.com", phone: "+91 98201 12345", city: "Mumbai" },
        items: [
          { id: "wb-01", title: "240 GSM Heavyweight Oversized Tee", size: "L", color: "Nautical Navy", price: 899, quantity: 2 }
        ],
        subtotal: 1798,
        discount: 269.7,
        shipping: 0,
        total: 1528.3,
        promoCode: "WAVE15",
        paymentMethod: "UPI",
        status: "Shipped",
        userPhone: "9820112345"
      }
    ]);
    this.appliedPromo = null;
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn("Storage load error:", e);
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    });
  }

  // --- PRODUCT MANAGEMENT (Admin & Store) ---
  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: "wb-" + Date.now().toString(36),
      title: productData.title.trim(),
      subtitle: productData.subtitle?.trim() || `${productData.gsm || 240} GSM Heavyweight Cotton`,
      price: Number(productData.price) || 899,
      comparePrice: Number(productData.comparePrice) || Math.round(Number(productData.price) * 1.5),
      gsm: Number(productData.gsm) || 240,
      fit: productData.fit || "Oversized Boxy Fit",
      colorName: productData.colorName || "Wave Classic",
      colorHex: productData.colorHex || "#0A1128",
      image: productData.image || "assets/images/tee-navy.jpg",
      gallery: productData.gallery?.length ? productData.gallery : [productData.image || "assets/images/tee-navy.jpg"],
      sizes: productData.sizes && productData.sizes.length ? productData.sizes : ["S", "M", "L", "XL"],
      stock: Number(productData.stock) !== undefined ? Number(productData.stock) : 25,
      badge: productData.badge?.trim() || "NEW DROP",
      rating: 5.0,
      reviewsCount: 1,
      description: productData.description || "Crafted with 100% pure combed cotton for the ultimate structured drape.",
      specs: productData.specs && productData.specs.length ? productData.specs : [
        `${productData.gsm || 240} GSM heavyweight combed cotton`,
        "Bio-washed & pre-shrunk for zero shrinkage",
        "Reinforced neckline retention",
        "Tailored streetwear fit"
      ],
      fabricCare: productData.fabricCare || "Machine wash cold with like colors. Tumble dry low or dry flat."
    };

    this.products.unshift(newProduct);
    this.save(this.STORAGE_KEYS.PRODUCTS, this.products);
    this.notify("PRODUCTS_UPDATED", this.products);
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products[index] = {
      ...this.products[index],
      ...updatedFields,
      price: Number(updatedFields.price !== undefined ? updatedFields.price : this.products[index].price),
      comparePrice: Number(updatedFields.comparePrice !== undefined ? updatedFields.comparePrice : this.products[index].comparePrice),
      gsm: Number(updatedFields.gsm !== undefined ? updatedFields.gsm : this.products[index].gsm),
      stock: Number(updatedFields.stock !== undefined ? updatedFields.stock : this.products[index].stock)
    };

    this.save(this.STORAGE_KEYS.PRODUCTS, this.products);
    this.notify("PRODUCTS_UPDATED", this.products);
    return this.products[index];
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.save(this.STORAGE_KEYS.PRODUCTS, this.products);
    // Also remove from cart
    this.cart = this.cart.filter(item => item.id !== id);
    this.save(this.STORAGE_KEYS.CART, this.cart);
    this.notify("PRODUCTS_UPDATED", this.products);
    this.notify("CART_UPDATED", this.cart);
    return true;
  }

  toggleStock(id) {
    const product = this.getProductById(id);
    if (!product) return;
    product.stock = product.stock > 0 ? 0 : 30;
    this.save(this.STORAGE_KEYS.PRODUCTS, this.products);
    this.notify("PRODUCTS_UPDATED", this.products);
  }

  // --- SETTINGS MANAGEMENT ---
  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save(this.STORAGE_KEYS.SETTINGS, this.settings);
    this.notify("SETTINGS_UPDATED", this.settings);
    return this.settings;
  }

  // --- PROMO CODE MANAGEMENT ---
  getPromos() {
    return [...this.promos];
  }

  addPromo(promo) {
    const code = promo.code.trim().toUpperCase();
    if (this.promos.find(p => p.code === code)) {
      throw new Error(`Promo code "${code}" already exists.`);
    }
    const newPromo = {
      code,
      discountPercent: Number(promo.discountPercent) || 10,
      minSpend: Number(promo.minSpend) || 0,
      description: promo.description || `${promo.discountPercent}% OFF on your order`
    };
    this.promos.push(newPromo);
    this.save(this.STORAGE_KEYS.PROMOS, this.promos);
    this.notify("PROMOS_UPDATED", this.promos);
    return newPromo;
  }

  deletePromo(code) {
    this.promos = this.promos.filter(p => p.code !== code.toUpperCase());
    if (this.appliedPromo && this.appliedPromo.code === code.toUpperCase()) {
      this.appliedPromo = null;
    }
    this.save(this.STORAGE_KEYS.PROMOS, this.promos);
    this.notify("PROMOS_UPDATED", this.promos);
    this.notify("CART_UPDATED", this.cart);
  }

  applyPromo(code) {
    const found = this.promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { success: false, message: "Invalid promo code. Try WAVE15" };
    }
    const subtotal = this.getCartSubtotal();
    if (subtotal < found.minSpend) {
      return { success: false, message: `Minimum cart value of ₹${found.minSpend} required for this code.` };
    }
    this.appliedPromo = found;
    this.notify("CART_UPDATED", this.cart);
    return { success: true, promo: found, message: `${found.discountPercent}% discount applied!` };
  }

  removeAppliedPromo() {
    this.appliedPromo = null;
    this.notify("CART_UPDATED", this.cart);
  }

  // --- CART MANAGEMENT ---
  getCart() {
    return [...this.cart];
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getCartCalculations() {
    const subtotal = this.getCartSubtotal();
    let discount = 0;
    if (this.appliedPromo && subtotal >= (this.appliedPromo.minSpend || 0)) {
      discount = (subtotal * this.appliedPromo.discountPercent) / 100;
    }
    const threshold = this.settings.freeShippingThreshold || 999;
    const shipping = subtotal === 0 || subtotal >= threshold ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shipping);
    const amountToFreeShipping = Math.max(0, threshold - subtotal);
    const freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));

    return {
      subtotal,
      discount,
      shipping,
      total,
      amountToFreeShipping,
      freeShippingProgress,
      appliedPromo: this.appliedPromo
    };
  }

  addToCart(productId, size, quantity = 1, customColor = null) {
    const product = this.getProductById(productId);
    if (!product) return false;

    const chosenColor = customColor || product.colorName;
    const existingIndex = this.cart.findIndex(
      item => item.id === productId && item.size === size && item.color === chosenColor
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        comparePrice: product.comparePrice,
        gsm: product.gsm,
        image: product.image,
        size: size || product.sizes[0] || "M",
        color: chosenColor,
        quantity: quantity
      });
    }

    this.save(this.STORAGE_KEYS.CART, this.cart);
    this.notify("CART_UPDATED", this.cart);
    return true;
  }

  updateCartQuantity(index, quantity) {
    if (index < 0 || index >= this.cart.length) return;
    if (quantity <= 0) {
      this.cart.splice(index, 1);
    } else {
      this.cart[index].quantity = quantity;
    }
    this.save(this.STORAGE_KEYS.CART, this.cart);
    this.notify("CART_UPDATED", this.cart);
  }

  removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.save(this.STORAGE_KEYS.CART, this.cart);
      this.notify("CART_UPDATED", this.cart);
    }
  }

  clearCart() {
    this.cart = [];
    this.appliedPromo = null;
    this.save(this.STORAGE_KEYS.CART, this.cart);
    this.notify("CART_UPDATED", this.cart);
  }

  // --- WISHLIST MANAGEMENT ---
  getWishlist() {
    return [...this.wishlist];
  }

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(productId);
    }
    this.save(this.STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify("WISHLIST_UPDATED", this.wishlist);
    return this.isInWishlist(productId);
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // --- USER AUTHENTICATION & PROFILE (MOBILE + OTP) ---
  getCurrentUser() {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  sendOtp(rawPhone, name = "") {
    const cleanPhone = (rawPhone || "").toString().replace(/\D/g, "");
    const phone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

    if (phone.length !== 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }

    // Generate random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.activeOtpSession = {
      phone,
      otp,
      name: name?.trim() || "",
      timestamp: Date.now()
    };

    return {
      success: true,
      phone,
      otp,
      message: `OTP sent successfully to +91 ${phone}`
    };
  }

  verifyOtp(enteredOtp) {
    if (!this.activeOtpSession) {
      return { success: false, message: "No active verification session. Please request OTP again." };
    }

    const cleanInput = (enteredOtp || "").toString().trim();
    if (cleanInput !== this.activeOtpSession.otp) {
      return { success: false, message: "Incorrect OTP. Please enter the 4-digit code sent to your mobile." };
    }

    const { phone, name } = this.activeOtpSession;
    let user = this.users.find(u => u.phone === phone);

    if (!user) {
      // Register new user
      user = {
        id: "usr-" + Date.now().toString(36),
        phone,
        name: name || "Bro Member",
        email: "",
        city: "",
        address: "",
        pincode: "",
        joinedDate: new Date().toISOString().split("T")[0]
      };
      this.users.unshift(user);
    } else if (name && (!user.name || user.name === "Bro Member")) {
      user.name = name;
    }

    this.currentUser = user;
    this.save(this.STORAGE_KEYS.USERS, this.users);
    this.save(this.STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.activeOtpSession = null;

    this.notify("AUTH_UPDATED", this.currentUser);
    return { success: true, user: this.currentUser, message: "Welcome to the wave!" };
  }

  logout() {
    this.currentUser = null;
    this.activeOtpSession = null;
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    this.notify("AUTH_UPDATED", null);
  }

  updateUserProfile(updates) {
    if (!this.currentUser) return null;

    this.currentUser = { ...this.currentUser, ...updates };
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id || u.phone === this.currentUser.phone);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.save(this.STORAGE_KEYS.USERS, this.users);
    }

    this.save(this.STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify("AUTH_UPDATED", this.currentUser);
    return this.currentUser;
  }

  getUserOrders(phone = null) {
    const targetPhone = phone || (this.currentUser ? this.currentUser.phone : null);
    if (!targetPhone) return [];
    
    const cleanTarget = targetPhone.replace(/\D/g, "").slice(-10);
    return this.orders.filter(order => {
      const orderPhone = (order.userPhone || order.customer?.phone || "").replace(/\D/g, "").slice(-10);
      return orderPhone === cleanTarget;
    });
  }

  // --- ORDER MANAGEMENT ---
  getOrders() {
    return [...this.orders];
  }

  createOrder(customerDetails, paymentMethod) {
    const calc = this.getCartCalculations();
    if (this.cart.length === 0) return null;

    const userPhone = this.currentUser ? this.currentUser.phone : (customerDetails.phone || "").replace(/\D/g, "").slice(-10);

    const newOrder = {
      id: "WB-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split("T")[0],
      customer: { ...customerDetails },
      items: [...this.cart],
      subtotal: calc.subtotal,
      discount: calc.discount,
      shipping: calc.shipping,
      total: calc.total,
      promoCode: this.appliedPromo ? this.appliedPromo.code : null,
      paymentMethod: paymentMethod || "UPI",
      status: "Processing",
      userPhone: userPhone || null
    };

    // Auto-update user profile address if user is logged in and address not set
    if (this.currentUser && (!this.currentUser.address || !this.currentUser.city)) {
      this.updateUserProfile({
        name: customerDetails.name || this.currentUser.name,
        email: customerDetails.email || this.currentUser.email,
        address: customerDetails.address || this.currentUser.address,
        city: customerDetails.city || this.currentUser.city,
        pincode: customerDetails.pincode || this.currentUser.pincode
      });
    }

    this.orders.unshift(newOrder);
    this.save(this.STORAGE_KEYS.ORDERS, this.orders);
    this.clearCart();
    this.notify("ORDER_CREATED", newOrder);
    this.notify("ORDERS_UPDATED", this.orders);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = newStatus;
    this.save(this.STORAGE_KEYS.ORDERS, this.orders);
    this.notify("ORDERS_UPDATED", this.orders);
    return true;
  }

  // --- RESET TO DEFAULTS ---
  resetToDefaults() {
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(this.STORAGE_KEYS.PROMOS);
    localStorage.removeItem(this.STORAGE_KEYS.CART);
    localStorage.removeItem(this.STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(this.STORAGE_KEYS.ORDERS);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
    this.init();
    this.notify("PRODUCTS_UPDATED", this.products);
    this.notify("SETTINGS_UPDATED", this.settings);
    this.notify("PROMOS_UPDATED", this.promos);
    this.notify("CART_UPDATED", this.cart);
    this.notify("WISHLIST_UPDATED", this.wishlist);
    this.notify("ORDERS_UPDATED", this.orders);
    this.notify("AUTH_UPDATED", this.currentUser);
  }
}

// Global store instance
const weaveStoreInstance = new StoreManager();
if (typeof window !== "undefined") {
  window.WeaveStore = weaveStoreInstance;
}
if (typeof globalThis !== "undefined") {
  globalThis.WeaveStore = weaveStoreInstance;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = weaveStoreInstance;
}
