import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ===== TABELAS DE AUTENTICAÇÃO (mantém igual) =====
export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userRelations = relations(userTable, ({ many, one }) => ({
  shippingAddresses: many(shippingAddressTable),
  cart: one(cartTable, {
    fields: [userTable.id],
    references: [cartTable.userId],
  }),
}));

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const melhorEnvioTokenTable = pgTable("melhor_envio_token", {
  id: uuid().primaryKey().defaultRandom(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== TABELAS DE PRODUTOS (ADAPTADO PRO CLIENTE) =====

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(), // Descrição da categoria
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable),
}));
export const productTable = pgTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "set null" }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),

  // ✅ Campos pro cliente
  volume: text().notNull(), // "60ml", "140ml", "30g"
  priceInCents: integer("price_in_cents").notNull(), // Preço direto no produto
  imageUrl: text("image_url").notNull(), // Imagem única do produto

  // Ingredientes e benefícios (opcional)
  ingredients: text(), // "Fricsoxidil, VEGF + BFGF, Jabo Randi, Alecrim"
  benefits: text(), // Texto dos benefícios

  // Controle de estoque (opcional)
  stock: integer().notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productRelations = relations(productTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
}));

export const shippingAddressTable = pgTable("shipping_address", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  recipientName: text("full_name").notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  country: text().notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text().notNull(),
  cpfOrCnpj: text("cpf_or_cnpj").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertShippingAddressSchema =
  createInsertSchema(shippingAddressTable);

export const shippingAddressRelations = relations(
  shippingAddressTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [shippingAddressTable.userId],
      references: [userTable.id],
    }),

    cart: one(cartTable, {
      fields: [shippingAddressTable.id],
      references: [cartTable.shippingAddressId],
    }),
  }),
);

export const cartTable = pgTable("cart", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id").references(
    () => shippingAddressTable.id,
    { onDelete: "set null" },
  ),
  shippingInCents: integer("shipping_in_cents").notNull().default(0),
  shippingMethod: text("shipping_method"),
  shippingServiceId: text("shipping_service_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartRelations = relations(cartTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [cartTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [cartTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(cartItemTable),
}));

export const cartItemTable = pgTable("cart_item", {
  id: uuid().primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => cartTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemTable.cartId],
    references: [cartTable.id],
  }),
  product: one(productTable, {
    fields: [cartItemTable.productId],
    references: [productTable.id],
  }),
}));

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
]);

export const orderTable = pgTable("order", {
  id: uuid().primaryKey().defaultRandom(),
  shortId: text("short_id").unique(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id")
    .notNull()
    .references(() => shippingAddressTable.id, { onDelete: "set null" }),
  recipientName: text().notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),
  totalPriceInCents: integer("total_price_in_cents").notNull(),
  status: orderStatus().notNull().default("pending"),
  emailNotifications: jsonb("email_notifications")
    .default({
      orderCreated: false,
      paymentPending: false,
      paymentApproved: false,
      processing: false,
      shipped: false,
      delivered: false,
    })
    .$type<{
      orderCreated: boolean;
      paymentPending: boolean;
      paymentApproved: boolean;
      processing: boolean;
      shipped: boolean;
      delivered: boolean;
    }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Frete
  shippingInCents: integer("shipping_in_cents").default(0),
  shippingMethod: text("shipping_method"), // "PAC", "SEDEX"
  shippingServiceId: text("shipping_service_id"), // Melhor Envio service ID (1=PAC, 2=SEDEX, etc)
  shippingCarrier: text("shipping_carrier"), // "Correios"

  // Rastreamento
  melhorEnvioOrderId: text("melhor_envio_order_id"), // ID no Melhor Envio
  trackingCode: text("tracking_code"), // Código de rastreio
  shippingLabelUrl: text("shipping_label_url"), // URL da etiqueta
});

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [orderTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(orderItemTable),
}));

export const orderItemTable = pgTable("order_item", {
  id: uuid().primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orderTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  product: one(productTable, {
    fields: [orderItemTable.productId],
    references: [productTable.id],
  }),
}));
