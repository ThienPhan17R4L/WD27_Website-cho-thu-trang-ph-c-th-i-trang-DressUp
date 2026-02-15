import { Express } from "express";
import { authRouter } from "./auth.routes";
import { productRouter } from "./product.routes";
import { categoryRouter } from "./category.route";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { paymentRouter } from "./payment.routes";
import { profileRouter } from "./profile.routes";
import { addressRouter } from "./address.routes";
import { adminUserRouter } from "./admin-user.routes";
import { variantRouter } from "./variant.routes";
import { uploadRouter } from "./upload.routes";
import { availabilityRouter } from "./availability.routes";
import { returnRouter } from "./return.routes";
import { couponRouter } from "./coupon.routes";
import { auditRouter } from "./audit.routes";
import { dashboardRouter } from "./dashboard.routes";
import { inventoryRouter } from "./inventory.routes";

function registerRoutes(app: Express) {
  // Auth & User
  app.use("/auth", authRouter);
  app.use("/profile", profileRouter);
  app.use("/addresses", addressRouter);

  // Catalog
  app.use("/products", productRouter);
  app.use("/categories", categoryRouter);
  app.use("/", variantRouter); // /products/:id/variants and /variants/:id
  app.use("/availability", availabilityRouter);

  // Commerce
  app.use("/cart", cartRouter);
  app.use("/orders", orderRouter);
  app.use("/payment", paymentRouter);
  app.use("/coupons", couponRouter);
  app.use("/", returnRouter); // /orders/:id/return and /returns/*

  // Upload
  app.use("/upload", uploadRouter);

  // Admin
  app.use("/admin/users", adminUserRouter);
  app.use("/admin/dashboard", dashboardRouter);
  app.use("/admin/audit-logs", auditRouter);
  app.use("/admin/inventory", inventoryRouter);
}

export default registerRoutes;
