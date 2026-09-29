// Automated Unit / Functionality Test for Weave Bro Store Engine & Auth Module

// Mock localStorage and window
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val.toString(); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.window = {};

// Load dependencies
require('./js/products-data.js');
require('./js/store.js');

const ws = global.window.WeaveStore;

console.log("--- 1. Testing Default Products ---");
const initialProds = ws.getProducts();
console.log(`Initial products count: ${initialProds.length}`);
if (initialProds.length < 5) throw new Error("Expected at least 5 initial products");
console.log(`✓ Default products loaded: ${initialProds.map(p => p.title).join(", ")}`);

console.log("\n--- 2. Testing Adding a Product (Admin CRUD) ---");
const added = ws.addProduct({
  title: "280 GSM Heavy Boxy Drop Tee",
  subtitle: "Midnight Wave • Loopback Knit",
  price: 1199,
  comparePrice: 1999,
  gsm: 280,
  fit: "Drop Shoulder Street Fit",
  colorName: "Midnight Wave",
  colorHex: "#0D1627",
  image: "assets/images/tee-navy.jpg",
  stock: 20
});
console.log(`✓ Product added with ID: ${added.id}`);
const prodsAfterAdd = ws.getProducts();
if (!prodsAfterAdd.find(p => p.id === added.id)) throw new Error("Product was not added to store");
console.log(`✓ Total products now: ${prodsAfterAdd.length}`);

console.log("\n--- 3. Testing User Authentication (Mobile + OTP) ---");
if (ws.isLoggedIn()) throw new Error("User should not be logged in initially");
console.log("Sending OTP to mobile: 9876543210...");
const otpRes = ws.sendOtp("9876543210", "Aarav Sharma");
console.log(`✓ OTP generated: ${otpRes.otp} for phone ${otpRes.phone}`);
if (!otpRes.otp || otpRes.otp.length !== 4) throw new Error("Invalid OTP generated");

console.log("Testing invalid OTP verification...");
const failVerify = ws.verifyOtp("0000");
if (failVerify.success) throw new Error("Expected invalid OTP to fail");
console.log("✓ Invalid OTP correctly rejected:", failVerify.message);

console.log("Testing valid OTP verification...");
const successVerify = ws.verifyOtp(otpRes.otp);
if (!successVerify.success) throw new Error("Valid OTP should succeed");
console.log(`✓ Logged in as: ${successVerify.user.name} (${successVerify.user.phone})`);
if (!ws.isLoggedIn()) throw new Error("ws.isLoggedIn() should be true");

console.log("\n--- 4. Testing Cart and Promo Code ---");
ws.addToCart(added.id, "L", 2, "Midnight Wave");
const cart = ws.getCart();
console.log(`Cart item count: ${ws.getCartCount()}, subtotal: ₹${ws.getCartSubtotal()}`);
if (cart.length !== 1 || ws.getCartSubtotal() !== 2398) throw new Error("Cart calculation mismatch");

const promoRes = ws.applyPromo("WAVE15");
console.log(`Promo result: ${promoRes.message}`);
const calc = ws.getCartCalculations();
console.log(`Subtotal: ₹${calc.subtotal}, Discount: ₹${calc.discount}, Shipping: ₹${calc.shipping}, Total: ₹${calc.total}`);
if (calc.discount !== 359.7 || calc.shipping !== 0) throw new Error("Discount or free shipping calculation failed");
console.log(`✓ Promo applied properly: 15% discount saved ₹${calc.discount}!`);

console.log("\n--- 5. Testing Order Creation with Authenticated User ---");
const order = ws.createOrder({
  name: "Aarav Sharma",
  email: "aarav@test.com",
  phone: "9876543210",
  address: "Tower 2, Apt 1404, Worli",
  city: "Mumbai",
  pincode: "400018"
}, "UPI");
console.log(`✓ Order placed: ID ${order.id}, total ₹${order.total}, userPhone: ${order.userPhone}`);
if (order.userPhone !== "9876543210") throw new Error("Order was not linked to user's phone");

console.log("\n--- 6. Testing Fetching User Orders ---");
const userOrders = ws.getUserOrders();
console.log(`✓ Found ${userOrders.length} orders for current user`);
if (userOrders.length === 0 || userOrders[0].id !== order.id) throw new Error("User orders fetch mismatch");

console.log("\n--- 7. Testing User Logout ---");
ws.logout();
if (ws.isLoggedIn()) throw new Error("User should be logged out");
console.log("✓ User successfully logged out!");

console.log("\n--- 8. Testing Product Deletion (Admin CRUD) ---");
ws.deleteProduct(added.id);
if (ws.getProductById(added.id)) throw new Error("Product should have been deleted");
console.log(`✓ Product ${added.id} deleted successfully. Catalog count now: ${ws.getProducts().length}`);

console.log("\n=============================================");
console.log("ALL STORE & AUTHENTICATION TESTS PASSED 100%!");
console.log("=============================================");
