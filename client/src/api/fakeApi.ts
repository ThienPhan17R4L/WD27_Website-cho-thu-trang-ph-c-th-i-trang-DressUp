// Simulated data and API functions
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}
interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}
interface Order {
  id: number;
  date: string;
  customer: string;
  total: number;
  status: string;
  items: OrderItem[];
  address: string;
}
interface Customer {
  id: number;
  name: string;
  email: string;
  ordersCount: number;
}

const products: Product[] = [
  { id: 1, name: "Elegant Evening Gown", category: "Dress", price: 100, stock: 5 },
  { id: 2, name: "Summer Floral Dress", category: "Dress", price: 70, stock: 2 },
  { id: 3, name: "Classic Black Suit", category: "Suit", price: 150, stock: 4 },
  { id: 4, name: "Designer Handbag", category: "Accessory", price: 120, stock: 1 },
  { id: 5, name: "Stiletto Heels", category: "Accessory", price: 60, stock: 0 },
  { id: 6, name: "Leather Jacket", category: "Dress", price: 80, stock: 7 },
  { id: 7, name: "Red Bridesmaid Dress", category: "Dress", price: 90, stock: 3 },
  { id: 8, name: "Blue Tuxedo", category: "Suit", price: 130, stock: 5 },
  { id: 9, name: "Silver Necklace", category: "Accessory", price: 40, stock: 10 },
  { id: 10, name: "Silk Scarf", category: "Accessory", price: 30, stock: 8 },
  { id: 11, name: "Vintage Wedding Dress", category: "Dress", price: 300, stock: 1 },
  { id: 12, name: "Kids Party Dress", category: "Dress", price: 50, stock: 9 },
  { id: 13, name: "Men's Black Tie", category: "Accessory", price: 20, stock: 15 },
  { id: 14, name: "Linen Summer Suit", category: "Suit", price: 110, stock: 0 },
  { id: 15, name: "Velvet Evening Gown", category: "Dress", price: 200, stock: 6 }
];
let nextProductId = 16;

const orders: Order[] = [
  {
    id: 1001,
    date: "2023-07-21",
    customer: "Alice Nguyen",
    total: 250,
    status: "Pending",
    address: "123 Fashion St, Hanoi",
    items: [
      { product: "Elegant Evening Gown", quantity: 1, price: 100 },
      { product: "Classic Black Suit", quantity: 1, price: 150 }
    ]
  },
  {
    id: 1000,
    date: "2023-07-18",
    customer: "Bob Tran",
    total: 150,
    status: "Completed",
    address: "456 Trendy Ave, HCM City",
    items: [
      { product: "Classic Black Suit", quantity: 1, price: 150 }
    ]
  },
  {
    id: 999,
    date: "2023-07-15",
    customer: "Charlie Pham",
    total: 100,
    status: "Cancelled",
    address: "789 Style St, Da Nang",
    items: [
      { product: "Summer Floral Dress", quantity: 1, price: 70 },
      { product: "Silk Scarf", quantity: 1, price: 30 }
    ]
  },
  {
    id: 998,
    date: "2023-07-10",
    customer: "Diana Le",
    total: 300,
    status: "Completed",
    address: "101 Fancy Rd, Hanoi",
    items: [
      { product: "Vintage Wedding Dress", quantity: 1, price: 300 }
    ]
  },
  {
    id: 997,
    date: "2023-07-05",
    customer: "Ethan Ho",
    total: 80,
    status: "Processing",
    address: "202 Party Ln, HCM City",
    items: [
      { product: "Leather Jacket", quantity: 1, price: 80 }
    ]
  },
  {
    id: 996,
    date: "2023-07-01",
    customer: "Fiona Tran",
    total: 110,
    status: "Completed",
    address: "303 Glam St, Hanoi",
    items: [
      { product: "Stiletto Heels", quantity: 1, price: 60 },
      { product: "Silk Scarf", quantity: 1, price: 30 },
      { product: "Men's Black Tie", quantity: 1, price: 20 }
    ]
  },
  {
    id: 995,
    date: "2023-06-25",
    customer: "George Nguyen",
    total: 60,
    status: "Cancelled",
    address: "404 Chic Blvd, HCM City",
    items: [
      { product: "Stiletto Heels", quantity: 1, price: 60 }
    ]
  },
  {
    id: 994,
    date: "2023-06-20",
    customer: "Hannah Vo",
    total: 200,
    status: "Pending",
    address: "505 Style Ave, Da Nang",
    items: [
      { product: "Velvet Evening Gown", quantity: 1, price: 200 }
    ]
  }
];

const customers: Customer[] = [
  { id: 1, name: "Alice Nguyen", email: "alice@example.com", ordersCount: 3 },
  { id: 2, name: "Bob Tran", email: "bob@example.com", ordersCount: 2 },
  { id: 3, name: "Charlie Pham", email: "charlie@example.com", ordersCount: 1 },
  { id: 4, name: "Diana Le", email: "diana@example.com", ordersCount: 1 },
  { id: 5, name: "Ethan Ho", email: "ethan@example.com", ordersCount: 1 },
  { id: 6, name: "Fiona Tran", email: "fiona@example.com", ordersCount: 1 },
  { id: 7, name: "George Nguyen", email: "george@example.com", ordersCount: 1 },
  { id: 8, name: "Hannah Vo", email: "hannah@example.com", ordersCount: 1 },
  { id: 9, name: "Ivy Lam", email: "ivy@example.com", ordersCount: 0 },
  { id: 10, name: "Jack Lee", email: "jack@example.com", ordersCount: 0 }
];

let settings = {
  storeName: "Fashion Rental Co.",
  storeEmail: "admin@fashionrent.com",
  storeAddress: "123 Fashion St, City, Country",
  storePhone: "0123456789"
};

// API functions

export function getProducts(page: number = 1, filter: string = ""): Promise<{ data: Product[]; total: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const pageSize = 10;
      const search = filter.toLowerCase();
      let filtered = products;
      if (search) {
        filtered = products.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
      }
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageData = filtered.slice(start, end);
      resolve({ data: pageData, total });
    }, 500);
  });
}

export function addProduct(product: Omit<Product, "id">): Promise<Product> {
  return new Promise(resolve => {
    setTimeout(() => {
      const newProduct: Product = { id: nextProductId++, ...product };
      // Add to the beginning of the list
      products.unshift(newProduct);
      resolve(newProduct);
    }, 500);
  });
}

export function getAllProducts(): Promise<Product[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...products]);
    }, 500);
  });
}

export function getOrders(): Promise<Order[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(orders);
    }, 500);
  });
}

export function getCustomers(): Promise<Customer[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(customers);
    }, 500);
  });
}

export function getDashboardData(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByMonth: { month: string; orders: number; revenue: number }[];
  productCategories: { category: string; count: number }[];
  recentActivity: { type: string; message: string; time: string }[];
}> {
  return new Promise(resolve => {
    setTimeout(() => {
      // Calculate totals
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      const totalCustomers = customers.length;
      const totalProducts = products.length;
      // Orders by month
      const ordersByMonthMap: { [month: string]: { orders: number; revenue: number } } = {};
      orders.forEach(order => {
        const monthKey = order.date.slice(0, 7); // "YYYY-MM"
        if (!ordersByMonthMap[monthKey]) {
          ordersByMonthMap[monthKey] = { orders: 0, revenue: 0 };
        }
        ordersByMonthMap[monthKey].orders += 1;
        ordersByMonthMap[monthKey].revenue += order.total;
      });
      const ordersByMonth = Object.keys(ordersByMonthMap).sort().map(key => {
        const monthIndex = parseInt(key.slice(5, 7), 10) - 1;
        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
        return {
          month: monthName,
          orders: ordersByMonthMap[key].orders,
          revenue: ordersByMonthMap[key].revenue
        };
      });
      // Product categories distribution
      const categoryCount: { [cat: string]: number } = {};
      products.forEach(p => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      });
      const productCategories = Object.keys(categoryCount).map(cat => ({
        category: cat,
        count: categoryCount[cat]
      }));
      // Recent activity (last few events)
      const recentActivity = [
        { type: "order_placed", message: `Order #${orders[0].id} has been placed by ${orders[0].customer}`, time: "2h ago" },
        { type: "order_completed", message: `Order #${orders[1].id} has been completed`, time: "5h ago" },
        { type: "customer_new", message: "New customer Ivy Lam has registered", time: "1d ago" }
      ];
      resolve({ totalOrders, totalRevenue, totalCustomers, totalProducts, ordersByMonth, productCategories, recentActivity });
    }, 500);
  });
}

export function getSettings(): Promise<typeof settings> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ ...settings });
    }, 500);
  });
}

export function updateSettings(newSettings: typeof settings): Promise<typeof settings> {
  return new Promise(resolve => {
    setTimeout(() => {
      settings = { ...newSettings };
      resolve(settings);
    }, 500);
  });
}
