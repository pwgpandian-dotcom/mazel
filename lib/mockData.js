// All demo data lives here — swap for real API calls when backend is ready

export const CATEGORIES = [
  { id: 'groceries', label: 'Groceries', emoji: '🛒', color: '166534' },
  { id: 'clothing',  label: 'Clothing',  emoji: '👗', color: '6b21a8' },
  { id: 'electronics', label: 'Electronics', emoji: '💻', color: '1d4ed8' },
  { id: 'home',      label: 'Home',      emoji: '🏠', color: 'c2410c' },
  { id: 'beauty',    label: 'Beauty',    emoji: '✨', color: 'be185d' },
  { id: 'handmade',  label: 'Handmade',  emoji: '🎨', color: 'b45309' },
];

export const SELLERS = [
  {
    id: 's1',
    name: 'Senthil Rajan',
    shopName: 'Senthil Stores',
    email: 'senthil@senthilstores.com',
    phone: '9876543210',
    location: 'Coimbatore, Tamil Nadu',
    status: 'approved',
    joinedDate: '2024-01-15',
    totalSales: 45200,
    totalOrders: 38,
    description: 'Organic groceries, handmade goods, and traditional Tamil products.',
  },
  {
    id: 's2',
    name: 'Priya Devi',
    shopName: 'Amman Textiles',
    email: 'priya@ammantextiles.com',
    phone: '9876543211',
    location: 'Chennai, Tamil Nadu',
    status: 'approved',
    joinedDate: '2024-02-20',
    totalSales: 89400,
    totalOrders: 62,
    description: 'Premium silk sarees, cotton wear, and handmade fashion accessories.',
  },
  {
    id: 's3',
    name: 'Kumar Raj',
    shopName: 'Kumar Electronics',
    email: 'kumar@kumarelectronics.com',
    phone: '9876543212',
    location: 'Madurai, Tamil Nadu',
    status: 'pending',
    joinedDate: '2024-03-10',
    totalSales: 0,
    totalOrders: 0,
    description: 'Quality electronics, gadgets, and accessories at affordable prices.',
  },
];

export const PRODUCTS = [
  // Groceries — Senthil Stores
  {
    id: 'p1', name: 'Organic Turmeric Powder', price: 180, category: 'groceries',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Pure, farm-fresh organic turmeric powder sourced directly from Erode farms. Rich in curcumin and anti-inflammatory compounds. Resealable 500g pack. No additives.',
    stock: 50, rating: 4.8, reviews: 24,
    image: 'https://images.unsplash.com/photo-1615485500704-8e3b5905b5d8?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p2', name: 'Cold-Pressed Coconut Oil', price: 350, category: 'groceries',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Traditional wood-pressed virgin coconut oil. Unrefined, chemical-free. Perfect for cooking, hair care, and skin care. 500ml glass bottle.',
    stock: 30, rating: 4.9, reviews: 41,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p3', name: 'Sundakkai Vathal (Turkey Berries)', price: 120, category: 'groceries',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Sun-dried turkey berries, a beloved Tamil condiment. Crispy when fried, great for rice dishes and rasam. 100g pack, traditionally sun-dried.',
    stock: 80, rating: 4.6, reviews: 15,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=280&fit=crop&auto=format',
  },
  // Clothing — Amman Textiles
  {
    id: 'p4', name: 'Kanjivaram Silk Dupatta', price: 2400, category: 'clothing',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: 'Pure Kanjivaram silk dupatta with traditional zari border. Rich temple design motifs woven by master weavers. Available in gold, red, and green colorways.',
    stock: 15, rating: 4.9, reviews: 48,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p5', name: 'Handblock Cotton Salwar Set', price: 1200, category: 'clothing',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: 'Comfortable hand-block-printed cotton salwar suit. Includes kurta, pants, and matching dupatta. Machine washable. Sizes S–XL.',
    stock: 22, rating: 4.6, reviews: 35,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p6', name: "Men's Linen Kurta", price: 899, category: 'clothing',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: "Premium linen kurta for men. Breathable fabric perfect for Tamil Nadu's climate. Minimalist design, easy care. Sizes M–XXL. Available in off-white and indigo.",
    stock: 30, rating: 4.5, reviews: 22,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=280&fit=crop&auto=format',
  },
  // Electronics — Kumar Electronics
  {
    id: 'p7', name: 'Wireless Earbuds Pro', price: 1299, category: 'electronics',
    sellerId: 's3', shopName: 'Kumar Electronics',
    description: 'True wireless earbuds with active noise cancellation. 8+24 hr battery, IPX5 water resistant. Includes compact charging case. Compatible with all devices.',
    stock: 45, rating: 4.4, reviews: 67,
    image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p8', name: 'USB-C 65W GaN Charger', price: 599, category: 'electronics',
    sellerId: 's3', shopName: 'Kumar Electronics',
    description: 'Compact 65W GaN USB-C fast charger. Supports PD 3.0. Works with laptops, phones, tablets. Dual-port (USB-C + USB-A). BIS certified.',
    stock: 60, rating: 4.5, reviews: 43,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p9', name: 'LED Architect Desk Lamp', price: 849, category: 'electronics',
    sellerId: 's3', shopName: 'Kumar Electronics',
    description: 'Adjustable LED desk lamp with 5 brightness levels and 3 color temperatures. Built-in USB charging port. Flicker-free, eye-care technology. Memory function.',
    stock: 28, rating: 4.6, reviews: 29,
    image: 'https://images.unsplash.com/photo-1524253482453-3fed94e87897?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p10', name: 'Portable Bluetooth Speaker', price: 1999, category: 'electronics',
    sellerId: 's3', shopName: 'Kumar Electronics',
    description: '360° stereo sound, 12-hour battery, IPX7 waterproof. Pair two speakers for true stereo. Built-in mic for calls. Perfect for travel and outdoor use.',
    stock: 20, rating: 4.7, reviews: 88,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=280&fit=crop&auto=format',
  },
  // Home — Senthil Stores
  {
    id: 'p11', name: 'Brass Diya Set (Set of 5)', price: 450, category: 'home',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Handcrafted pure brass oil lamps. Ideal for puja and home décor. Polished finish, traditional Tanjore design. Includes cotton wicks.',
    stock: 25, rating: 4.7, reviews: 19,
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p12', name: 'Handwoven Bamboo Basket', price: 280, category: 'home',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Natural bamboo storage basket, handwoven by local artisans. Eco-friendly and sturdy. Perfect for fruits, laundry, or décor. Medium size (30cm diameter).',
    stock: 40, rating: 4.4, reviews: 12,
    image: 'https://images.unsplash.com/photo-1474898857238-2d5b7dec68f8?w=400&h=280&fit=crop&auto=format',
  },
  // Beauty
  {
    id: 'p13', name: 'Natural Kumkumadi Face Oil', price: 850, category: 'beauty',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: 'Traditional ayurvedic kumkumadi tailam with pure saffron and sandalwood. Brightens complexion and reduces pigmentation. 30ml amber glass dropper bottle.',
    stock: 18, rating: 4.8, reviews: 56,
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p14', name: 'Herbal Neem Face Pack', price: 199, category: 'beauty',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Herbal neem and turmeric face pack. Controls excess oil, reduces acne, brightens skin. 100% natural ingredients. 100g. Suitable for all skin types.',
    stock: 60, rating: 4.5, reviews: 33,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=280&fit=crop&auto=format',
  },
  // Handmade
  {
    id: 'p15', name: 'Terracotta Planter Set (3 pcs)', price: 350, category: 'handmade',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Hand-painted terracotta planters in traditional Tanjore art style. Set of 3 (small 4\", medium 6\", large 8\"). Drainage holes included. Each piece is unique.',
    stock: 20, rating: 4.8, reviews: 27,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p16', name: 'Kolam Stencil Kit (10 pcs)', price: 299, category: 'handmade',
    sellerId: 's1', shopName: 'Senthil Stores',
    description: 'Set of 10 reusable premium plastic kolam (rangoli) stencils in traditional patterns — peacock, lotus, and geometric designs. Comes with a bag.',
    stock: 35, rating: 4.3, reviews: 9,
    image: 'https://images.unsplash.com/photo-1562602833-63f4e28228e6?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p17', name: 'Hand-Embroidered Tote Bag', price: 650, category: 'handmade',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: 'Hand-embroidered cotton canvas tote with Tamil floral motifs. Sturdy handles, zip pocket inside. Each bag is uniquely crafted by women artisans in Chennai.',
    stock: 12, rating: 4.7, reviews: 31,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=280&fit=crop&auto=format',
  },
  {
    id: 'p18', name: 'Jasmine Soy Candle Set (3 pcs)', price: 380, category: 'handmade',
    sellerId: 's2', shopName: 'Amman Textiles',
    description: 'Set of 3 handmade soy wax candles in jasmine, mogra, and sandalwood. 100% natural. 40+ hour burn time each. Beautifully boxed — perfect as a gift.',
    stock: 25, rating: 4.6, reviews: 18,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=280&fit=crop&auto=format',
  },
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-2024-001',
    buyerName: 'Ananya Krishnan',
    buyerPhone: '9876501234',
    address: '14, Gandhi Nagar, 3rd Street, Coimbatore — 641012',
    items: [
      { productId: 'p1', name: 'Organic Turmeric Powder', price: 180, qty: 2 },
      { productId: 'p2', name: 'Cold-Pressed Coconut Oil', price: 350, qty: 1 },
    ],
    sellerId: 's1',
    total: 710,
    commission: 56.80,
    paymentMethod: 'COD',
    status: 'delivered',
    placedAt: '2024-03-01T10:23:00',
  },
  {
    id: 'ORD-2024-002',
    buyerName: 'Meera Sundaram',
    buyerPhone: '9876502345',
    address: '7/B, Anna Salai, Teynampet, Chennai — 600002',
    items: [
      { productId: 'p4', name: 'Kanjivaram Silk Dupatta', price: 2400, qty: 1 },
    ],
    sellerId: 's2',
    total: 2400,
    commission: 192,
    paymentMethod: 'Online',
    status: 'shipped',
    placedAt: '2024-03-08T14:11:00',
  },
  {
    id: 'ORD-2024-003',
    buyerName: 'Rajesh Murugan',
    buyerPhone: '9876503456',
    address: '22, Nehru Street, Anna Nagar, Madurai — 625001',
    items: [
      { productId: 'p7', name: 'Wireless Earbuds Pro', price: 1299, qty: 1 },
      { productId: 'p8', name: 'USB-C 65W GaN Charger', price: 599, qty: 1 },
      { productId: 'p9', name: 'LED Architect Desk Lamp', price: 849, qty: 1 },
    ],
    sellerId: 's3',
    total: 2747,
    commission: 219.76,
    paymentMethod: 'Online',
    status: 'placed',
    placedAt: '2024-03-14T09:45:00',
  },
  {
    id: 'ORD-2024-004',
    buyerName: 'Ananya Krishnan',
    buyerPhone: '9876501234',
    address: '14, Gandhi Nagar, 3rd Street, Coimbatore — 641012',
    items: [
      { productId: 'p5', name: 'Handblock Cotton Salwar Set', price: 1200, qty: 1 },
      { productId: 'p17', name: 'Hand-Embroidered Tote Bag', price: 650, qty: 1 },
    ],
    sellerId: 's2',
    total: 1850,
    commission: 148,
    paymentMethod: 'COD',
    status: 'delivered',
    placedAt: '2024-03-05T11:30:00',
  },
  {
    id: 'ORD-2024-005',
    buyerName: 'Vikram Nair',
    buyerPhone: '9876505678',
    address: '33, Bharathiar Road, RS Puram, Coimbatore — 641037',
    items: [
      { productId: 'p15', name: 'Terracotta Planter Set', price: 350, qty: 1 },
      { productId: 'p11', name: 'Brass Diya Set', price: 450, qty: 1 },
    ],
    sellerId: 's1',
    total: 800,
    commission: 64,
    paymentMethod: 'COD',
    status: 'placed',
    placedAt: '2024-03-14T16:20:00',
  },
];

// The demo buyer's order history
export const BUYER_ORDERS = MOCK_ORDERS.filter(o =>
  ['ORD-2024-001', 'ORD-2024-004'].includes(o.id)
);

// The current demo seller (switch to s2 or s3 to show different seller)
export const CURRENT_SELLER = SELLERS[0];

export function getSellerProducts(sellerId) {
  return PRODUCTS.filter(p => p.sellerId === sellerId);
}

export function getSellerOrders(sellerId) {
  return MOCK_ORDERS.filter(o => o.sellerId === sellerId);
}

export const ADMIN_STATS = {
  totalOrders: 127,
  totalRevenue: 348500,
  totalCommission: 27880,
  totalSellers: 3,
  approvedSellers: 2,
  pendingSellers: 1,
  totalProducts: 18,
  totalBuyers: 84,
};

export function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label ?? id;
}

export function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
