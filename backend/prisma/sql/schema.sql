-- ============================================================================
-- Multi-vendor marketplace — PostgreSQL schema
-- Generated to mirror packages/database/prisma/schema.prisma table-for-table
-- (table/column names, types, defaults, and constraints match exactly).
-- Target: PostgreSQL 15+ (Supabase)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');
CREATE TYPE address_type AS ENUM ('SHIPPING', 'BILLING', 'SHOP');
CREATE TYPE vendor_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE shop_status AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED');
CREATE TYPE service_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE inventory_change_type AS ENUM ('RESTOCK', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION', 'RELEASE');
CREATE TYPE coupon_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');
CREATE TYPE coupon_scope AS ENUM ('PLATFORM', 'VENDOR', 'SHOP');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE order_item_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE payment_provider AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'WALLET', 'CASH_ON_DELIVERY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE refund_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');
CREATE TYPE shipment_status AS ENUM ('PENDING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED');
CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
CREATE TYPE ad_placement AS ENUM ('HOMEPAGE_BANNER', 'CATEGORY_PAGE', 'SEARCH_RESULTS', 'PRODUCT_PAGE', 'SHOP_PAGE');
CREATE TYPE ad_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'REJECTED', 'EXPIRED', 'COMPLETED');
CREATE TYPE ad_event_type AS ENUM ('IMPRESSION', 'CLICK');
CREATE TYPE notification_type AS ENUM ('ORDER_UPDATE', 'PAYMENT', 'PROMOTION', 'VENDOR_APPROVAL', 'REVIEW', 'SYSTEM', 'CHAT', 'REFERRAL', 'INVENTORY');
CREATE TYPE ai_chat_context AS ENUM ('SHOPPING_ASSISTANT', 'SUPPORT', 'PRODUCT_RECOMMENDATION');
CREATE TYPE ai_chat_session_status AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');
CREATE TYPE ai_chat_role AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE referral_status AS ENUM ('PENDING', 'QUALIFIED', 'REWARDED', 'EXPIRED');

-- ============================================================================
-- AUTH & USERS
-- ============================================================================

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          TEXT NOT NULL UNIQUE,
    email_verified TIMESTAMP(3),
    phone          TEXT UNIQUE,
    phone_verified TIMESTAMP(3),
    password_hash  TEXT,
    name           TEXT NOT NULL,
    avatar_url     TEXT,
    role           user_role NOT NULL DEFAULT 'CUSTOMER',
    status         user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at  TIMESTAMP(3),
    created_at     TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP(3) NOT NULL,
    deleted_at     TIMESTAMP(3)
);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type                TEXT NOT NULL,
    provider            TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token       TEXT,
    access_token        TEXT,
    expires_at          INTEGER,
    token_type          TEXT,
    scope               TEXT,
    id_token            TEXT,
    session_state       TEXT,
    UNIQUE (provider, provider_account_id)
);
CREATE INDEX idx_accounts_user_id ON accounts (user_id);

CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT NOT NULL UNIQUE,
    user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires       TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token      TEXT NOT NULL UNIQUE,
    expires    TIMESTAMP(3) NOT NULL,
    UNIQUE (identifier, token)
);

CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type        address_type NOT NULL DEFAULT 'SHIPPING',
    label       TEXT,
    full_name   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    line1       TEXT NOT NULL,
    line2       TEXT,
    city        TEXT NOT NULL,
    state       TEXT NOT NULL,
    country     TEXT NOT NULL,
    postal_code TEXT,
    latitude    NUMERIC(9, 6),
    longitude   NUMERIC(9, 6),
    is_default  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_addresses_user_id ON addresses (user_id);

CREATE TABLE admin_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    department  TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at  TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- AUTH SESSIONS & TOKENS
-- Only a hash of every token is persisted; raw tokens exist only in the
-- email/response sent to the user and are never stored at rest.
-- ============================================================================

CREATE TABLE email_verification_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP(3) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens (user_id);

CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP(3) NOT NULL,
    used_at    TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- One row per issued refresh token = one active login "session" / device.
CREATE TABLE refresh_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash    TEXT NOT NULL UNIQUE,
    remember_me   BOOLEAN NOT NULL DEFAULT false,
    user_agent    TEXT,
    ip_address    TEXT,
    expires_at    TIMESTAMP(3) NOT NULL,
    revoked_at    TIMESTAMP(3),
    replaced_by   UUID,
    last_used_at  TIMESTAMP(3) NOT NULL DEFAULT now(),
    created_at    TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- ============================================================================
-- VENDOR & SHOPS
-- ============================================================================

CREATE TABLE vendor_profiles (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    business_name             TEXT NOT NULL,
    business_registration_no  TEXT,
    tax_id                    TEXT,
    status                    vendor_status NOT NULL DEFAULT 'PENDING',
    commission_rate           NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    bank_name                 TEXT,
    bank_account_name         TEXT,
    bank_account_number       TEXT,
    approved_at               TIMESTAMP(3),
    created_at                TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at                TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_vendor_profiles_status ON vendor_profiles (status);

CREATE TABLE shops (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id    UUID NOT NULL REFERENCES vendor_profiles (id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    description  TEXT,
    logo_url     TEXT,
    banner_url   TEXT,
    address_id   UUID REFERENCES addresses (id) ON DELETE SET NULL,
    status       shop_status NOT NULL DEFAULT 'PENDING_APPROVAL',
    avg_rating   NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP(3) NOT NULL,
    deleted_at   TIMESTAMP(3)
);
CREATE INDEX idx_shops_vendor_id ON shops (vendor_id);
CREATE INDEX idx_shops_status ON shops (status);
CREATE INDEX idx_shops_address_id ON shops (address_id);

-- ============================================================================
-- CATALOG: CATEGORIES / PRODUCTS / SERVICES
-- ============================================================================

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   UUID REFERENCES categories (id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);

CREATE TABLE products (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id          UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
    category_id      UUID REFERENCES categories (id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description      TEXT,
    sku              TEXT UNIQUE,
    base_price       NUMERIC(12, 2) NOT NULL,
    compare_at_price NUMERIC(12, 2),
    currency         VARCHAR(3) NOT NULL DEFAULT 'GHS',
    status           product_status NOT NULL DEFAULT 'DRAFT',
    weight_grams     INTEGER,
    avg_rating       NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count     INTEGER NOT NULL DEFAULT 0,
    view_count       INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP(3) NOT NULL,
    deleted_at       TIMESTAMP(3)
);
CREATE INDEX idx_products_shop_id ON products (shop_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_name ON products (name);

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    alt_text   TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product_id ON product_images (product_id);

CREATE TABLE product_variants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    sku              TEXT NOT NULL UNIQUE,
    name             TEXT NOT NULL,
    price            NUMERIC(12, 2) NOT NULL,
    compare_at_price NUMERIC(12, 2),
    attributes       JSONB NOT NULL,
    image_url        TEXT,
    created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

CREATE TABLE product_attributes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    value      TEXT NOT NULL,
    UNIQUE (product_id, name)
);

CREATE TABLE services (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id          UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
    category_id      UUID REFERENCES categories (id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description      TEXT,
    price            NUMERIC(12, 2) NOT NULL,
    currency         VARCHAR(3) NOT NULL DEFAULT 'GHS',
    duration_minutes INTEGER NOT NULL,
    status           service_status NOT NULL DEFAULT 'DRAFT',
    avg_rating       NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count     INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_services_shop_id ON services (shop_id);
CREATE INDEX idx_services_category_id ON services (category_id);

CREATE TABLE service_bookings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id       UUID NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    customer_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    scheduled_at     TIMESTAMP(3) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status           booking_status NOT NULL DEFAULT 'PENDING',
    price            NUMERIC(12, 2) NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_service_bookings_service_id ON service_bookings (service_id);
CREATE INDEX idx_service_bookings_customer_id ON service_bookings (customer_id);
CREATE INDEX idx_service_bookings_scheduled_at ON service_bookings (scheduled_at);

-- ============================================================================
-- INVENTORY
-- ============================================================================

CREATE TABLE inventory (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id         UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    variant_id         UUID UNIQUE REFERENCES product_variants (id) ON DELETE CASCADE,
    shop_id            UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
    quantity           INTEGER NOT NULL DEFAULT 0,
    reserved_quantity  INTEGER NOT NULL DEFAULT 0,
    reorder_level      INTEGER NOT NULL DEFAULT 5,
    warehouse_location TEXT,
    created_at         TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP(3) NOT NULL,
    UNIQUE (product_id, variant_id)
);
CREATE INDEX idx_inventory_shop_id ON inventory (shop_id);

CREATE TABLE inventory_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id   UUID NOT NULL REFERENCES inventory (id) ON DELETE CASCADE,
    change_type    inventory_change_type NOT NULL,
    quantity_delta INTEGER NOT NULL,
    reference_id   TEXT,
    note           TEXT,
    created_by_id  UUID REFERENCES users (id) ON DELETE SET NULL,
    created_at     TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_logs_inventory_id ON inventory_logs (inventory_id);

-- ============================================================================
-- CART & WISHLIST
-- ============================================================================

CREATE TABLE carts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    session_id TEXT UNIQUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL
);

CREATE TABLE cart_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id        UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    variant_id     UUID REFERENCES product_variants (id) ON DELETE CASCADE,
    quantity       INTEGER NOT NULL DEFAULT 1,
    price_snapshot NUMERIC(12, 2) NOT NULL,
    created_at     TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP(3) NOT NULL,
    UNIQUE (cart_id, product_id, variant_id)
);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);

CREATE TABLE wishlists (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id  UUID NOT NULL REFERENCES wishlists (id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    variant_id   UUID REFERENCES product_variants (id) ON DELETE CASCADE,
    created_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
    UNIQUE (wishlist_id, product_id, variant_id)
);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items (product_id);

-- ============================================================================
-- COUPONS
-- ============================================================================

CREATE TABLE coupons (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                 TEXT NOT NULL UNIQUE,
    description          TEXT,
    type                 coupon_type NOT NULL,
    value                NUMERIC(12, 2) NOT NULL,
    scope                coupon_scope NOT NULL DEFAULT 'PLATFORM',
    vendor_id            UUID REFERENCES vendor_profiles (id) ON DELETE CASCADE,
    shop_id              UUID REFERENCES shops (id) ON DELETE CASCADE,
    min_order_amount     NUMERIC(12, 2),
    max_discount_amount  NUMERIC(12, 2),
    usage_limit          INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    used_count           INTEGER NOT NULL DEFAULT 0,
    starts_at            TIMESTAMP(3),
    expires_at           TIMESTAMP(3),
    is_active            BOOLEAN NOT NULL DEFAULT true,
    created_at           TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_coupons_vendor_id ON coupons (vendor_id);
CREATE INDEX idx_coupons_shop_id ON coupons (shop_id);
CREATE INDEX idx_coupons_is_active ON coupons (is_active);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        TEXT NOT NULL UNIQUE,
    customer_id         UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    status              order_status NOT NULL DEFAULT 'PENDING',
    subtotal            NUMERIC(12, 2) NOT NULL,
    discount_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(12, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'GHS',
    coupon_id           UUID REFERENCES coupons (id) ON DELETE SET NULL,
    shipping_address_id UUID NOT NULL REFERENCES addresses (id) ON DELETE RESTRICT,
    billing_address_id  UUID REFERENCES addresses (id) ON DELETE SET NULL,
    customer_note       TEXT,
    placed_at           TIMESTAMP(3) NOT NULL DEFAULT now(),
    created_at          TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_placed_at ON orders (placed_at);

CREATE TABLE order_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
    variant_id   UUID REFERENCES product_variants (id) ON DELETE SET NULL,
    shop_id      UUID NOT NULL REFERENCES shops (id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    sku          TEXT,
    unit_price   NUMERIC(12, 2) NOT NULL,
    quantity     INTEGER NOT NULL,
    subtotal     NUMERIC(12, 2) NOT NULL,
    status       order_item_status NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
CREATE INDEX idx_order_items_shop_id ON order_items (shop_id);

CREATE TABLE coupon_usages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id       UUID NOT NULL REFERENCES coupons (id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    order_id        UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    discount_amount NUMERIC(12, 2) NOT NULL,
    used_at         TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages (coupon_id);
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages (user_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    provider           payment_provider NOT NULL,
    provider_reference TEXT NOT NULL UNIQUE,
    status             payment_status NOT NULL DEFAULT 'PENDING',
    amount             NUMERIC(12, 2) NOT NULL,
    currency           VARCHAR(3) NOT NULL DEFAULT 'GHS',
    paid_at            TIMESTAMP(3),
    metadata           JSONB,
    created_at         TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_payments_status ON payments (status);

CREATE TABLE payment_refunds (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id   UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
    amount       NUMERIC(12, 2) NOT NULL,
    reason       TEXT,
    status       refund_status NOT NULL DEFAULT 'PENDING',
    processed_at TIMESTAMP(3),
    created_at   TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_refunds_payment_id ON payment_refunds (payment_id);

-- ============================================================================
-- SHIPPING & DELIVERY TRACKING
-- ============================================================================

CREATE TABLE shipping_methods (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               TEXT NOT NULL,
    carrier            TEXT,
    base_cost          NUMERIC(12, 2) NOT NULL,
    estimated_days_min INTEGER NOT NULL,
    estimated_days_max INTEGER NOT NULL,
    is_active          BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE shipments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    shop_id               UUID NOT NULL REFERENCES shops (id) ON DELETE RESTRICT,
    shipping_method_id    UUID REFERENCES shipping_methods (id) ON DELETE SET NULL,
    tracking_number       TEXT UNIQUE,
    carrier               TEXT,
    status                shipment_status NOT NULL DEFAULT 'PENDING',
    shipping_cost         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipped_at            TIMESTAMP(3),
    delivered_at          TIMESTAMP(3),
    estimated_delivery_at TIMESTAMP(3),
    created_at            TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_shipments_order_id ON shipments (order_id);
CREATE INDEX idx_shipments_shop_id ON shipments (shop_id);
CREATE INDEX idx_shipments_status ON shipments (status);

CREATE TABLE shipment_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id   UUID NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items (id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL,
    UNIQUE (shipment_id, order_item_id)
);

CREATE TABLE delivery_tracking_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
    status      shipment_status NOT NULL,
    location    TEXT,
    description TEXT,
    occurred_at TIMESTAMP(3) NOT NULL,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_delivery_tracking_events_shipment_id ON delivery_tracking_events (shipment_id);

-- ============================================================================
-- REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE product_reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    order_item_id        UUID UNIQUE REFERENCES order_items (id) ON DELETE SET NULL,
    rating               SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title                TEXT,
    comment              TEXT,
    images               TEXT[] NOT NULL DEFAULT '{}',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    status               review_status NOT NULL DEFAULT 'PENDING',
    vendor_reply         TEXT,
    vendor_reply_at      TIMESTAMP(3),
    created_at           TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP(3) NOT NULL,
    UNIQUE (product_id, user_id)
);
CREATE INDEX idx_product_reviews_product_id ON product_reviews (product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews (user_id);

CREATE TABLE shop_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    status          review_status NOT NULL DEFAULT 'PENDING',
    vendor_reply    TEXT,
    vendor_reply_at TIMESTAMP(3),
    created_at      TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP(3) NOT NULL,
    UNIQUE (shop_id, user_id)
);
CREATE INDEX idx_shop_reviews_shop_id ON shop_reviews (shop_id);
CREATE INDEX idx_shop_reviews_user_id ON shop_reviews (user_id);

-- ============================================================================
-- ADVERTISEMENTS
-- ============================================================================

CREATE TABLE advertisements (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    shop_id        UUID REFERENCES shops (id) ON DELETE CASCADE,
    product_id     UUID REFERENCES products (id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    image_url      TEXT NOT NULL,
    target_url     TEXT NOT NULL,
    placement      ad_placement NOT NULL,
    status         ad_status NOT NULL DEFAULT 'PENDING_REVIEW',
    budget         NUMERIC(12, 2) NOT NULL,
    amount_spent   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_per_click NUMERIC(8, 2),
    impressions    INTEGER NOT NULL DEFAULT 0,
    clicks         INTEGER NOT NULL DEFAULT 0,
    starts_at      TIMESTAMP(3) NOT NULL,
    ends_at        TIMESTAMP(3) NOT NULL,
    created_at     TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_advertisements_advertiser_id ON advertisements (advertiser_id);
CREATE INDEX idx_advertisements_status ON advertisements (status);
CREATE INDEX idx_advertisements_placement ON advertisements (placement);

CREATE TABLE ad_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID NOT NULL REFERENCES advertisements (id) ON DELETE CASCADE,
    user_id          UUID REFERENCES users (id) ON DELETE SET NULL,
    type             ad_event_type NOT NULL,
    occurred_at      TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_ad_events_advertisement_id ON ad_events (advertisement_id);
CREATE INDEX idx_ad_events_occurred_at ON ad_events (occurred_at);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type       notification_type NOT NULL,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    data       JSONB,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    read_at    TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id_is_read ON notifications (user_id, is_read);

-- ============================================================================
-- AI CHAT HISTORY
-- ============================================================================

CREATE TABLE ai_chat_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users (id) ON DELETE CASCADE,
    title      TEXT,
    context    ai_chat_context NOT NULL DEFAULT 'SHOPPING_ASSISTANT',
    status     ai_chat_session_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL
);
CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions (user_id);

CREATE TABLE ai_chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES ai_chat_sessions (id) ON DELETE CASCADE,
    role        ai_chat_role NOT NULL,
    content     TEXT NOT NULL,
    tokens_used INTEGER,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages (session_id);

-- ============================================================================
-- REFERRAL PROGRAM
-- ============================================================================

CREATE TABLE referral_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    code       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE referrals (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code_id      UUID NOT NULL REFERENCES referral_codes (id) ON DELETE CASCADE,
    referrer_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    referee_id            UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    status                referral_status NOT NULL DEFAULT 'PENDING',
    qualifying_order_id   UUID UNIQUE REFERENCES orders (id) ON DELETE SET NULL,
    referrer_reward       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    referee_reward        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    referrer_rewarded_at  TIMESTAMP(3),
    referee_rewarded_at   TIMESTAMP(3),
    created_at            TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX idx_referrals_status ON referrals (status);
