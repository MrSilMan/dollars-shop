--
-- PostgreSQL database dump
--

\restrict qCkse5QKJtElN0U5brMKv7YmgPec46je9gLdktKEIPx1lN7hEzXb28abuwYGUwf

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-06-08 15:51:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 918 (class 1247 OID 239029)
-- Name: CouponType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


ALTER TYPE public."CouponType" OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 239351)
-- Name: FontScale; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FontScale" AS ENUM (
    'SMALL',
    'MEDIUM',
    'LARGE'
);


ALTER TYPE public."FontScale" OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 238424)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 238452)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'ECOCASH',
    'INNBUCKS',
    'CASH_ON_DELIVERY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 238440)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'UNPAID',
    'PENDING_VERIFICATION',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 867 (class 1247 OID 238418)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 238473)
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text NOT NULL,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    province text NOT NULL,
    country text DEFAULT 'Zimbabwe'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 239359)
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id text DEFAULT 'default'::text NOT NULL,
    "primaryColor" text DEFAULT '#1A4D3A'::text NOT NULL,
    "accentColor" text DEFAULT '#F5A623'::text NOT NULL,
    "bgColor" text DEFAULT '#F8FAF9'::text NOT NULL,
    "textColor" text DEFAULT '#1A2E25'::text NOT NULL,
    "logoUrl" text,
    "appName" text DEFAULT 'Dollar Shop'::text NOT NULL,
    "footerText" text DEFAULT '© 2025 Dollar Shop — Quality Everyday. Every Dollar Counts.'::text NOT NULL,
    "fontScale" public."FontScale" DEFAULT 'MEDIUM'::public."FontScale" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "faviconUrl" text
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 238531)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "variantId" text
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 238492)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    "imageUrl" text,
    "parentId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 239053)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code text NOT NULL,
    type public."CouponType" NOT NULL,
    value numeric(10,2) NOT NULL,
    "minOrder" numeric(10,2),
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 238679)
-- Name: hero_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hero_slides (
    id text NOT NULL,
    tag text NOT NULL,
    "tagBg" text DEFAULT '#ffffff33'::text NOT NULL,
    headline text NOT NULL,
    sub text NOT NULL,
    "ctaLabel" text NOT NULL,
    "ctaHref" text DEFAULT '/shop'::text NOT NULL,
    "imageUrl" text,
    "bgFrom" text DEFAULT '#FF4400'::text NOT NULL,
    "bgTo" text DEFAULT '#E63900'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ctaBg" text DEFAULT '#FFFFFF'::text NOT NULL
);


ALTER TABLE public.hero_slides OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 238753)
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_subscribers (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.newsletter_subscribers OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 238581)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    "productSku" text NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "variantSnapshot" text
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 238556)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    "guestEmail" text,
    "guestPhone" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "paymentRef" text,
    subtotal numeric(10,2) NOT NULL,
    "deliveryFee" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "shippingAddress" jsonb NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "couponCode" text,
    "couponId" text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 239033)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    "groupName" text DEFAULT 'Variant'::text NOT NULL,
    value text NOT NULL,
    sku text,
    stock integer DEFAULT 0 NOT NULL,
    "priceAdjust" numeric(10,2) DEFAULT 0 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 238506)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "compareAtPrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "lowStockAlert" integer DEFAULT 10 NOT NULL,
    images text[],
    tags text[],
    "categoryId" text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    weight numeric(8,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 238729)
-- Name: promo_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_cards (
    id text NOT NULL,
    amount text NOT NULL,
    label text NOT NULL,
    "desc" text NOT NULL,
    sub text NOT NULL,
    href text DEFAULT '/shop'::text NOT NULL,
    "leftBg" text NOT NULL,
    "rightBg" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promo_cards OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 238596)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 238706)
-- Name: side_promos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.side_promos (
    id text NOT NULL,
    label text NOT NULL,
    headline text NOT NULL,
    href text DEFAULT '/shop'::text NOT NULL,
    "imageUrl" text,
    "bgFrom" text DEFAULT '#FF4400'::text NOT NULL,
    "bgTo" text DEFAULT '#E63900'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.side_promos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 238459)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    phone text,
    "passwordHash" text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 238544)
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- TOC entry 5193 (class 0 OID 238473)
-- Dependencies: 220
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", label, line1, line2, city, province, country, "isDefault", "createdAt") FROM stdin;
\.


--
-- TOC entry 5207 (class 0 OID 239359)
-- Dependencies: 234
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, "primaryColor", "accentColor", "bgColor", "textColor", "logoUrl", "appName", "footerText", "fontScale", "updatedAt", "faviconUrl") FROM stdin;
default	#e3029a	#a315e1	#ffffff	#282424	/uploads/logo-1780051255971.png	Dollar Shop	© 2026 CROSSERA — Quality Everyday. Every Dollar Counts.	MEDIUM	2026-06-06 15:49:02.714	/uploads/favicon-1780053160739.png
\.


--
-- TOC entry 5196 (class 0 OID 238531)
-- Dependencies: 223
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "userId", "sessionId", "productId", quantity, "createdAt", "updatedAt", "variantId") FROM stdin;
cmpwrw4df000jakc59rapn58o	cmpnuvjxq0000d0c56zf7uwxb	\N	cmps7o6to000lbsc5tc1x5qtw	1	2026-06-02 15:08:54.435	2026-06-02 15:08:54.435	\N
\.


--
-- TOC entry 5194 (class 0 OID 238492)
-- Dependencies: 221
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, icon, "imageUrl", "parentId", "sortOrder", "isActive") FROM stdin;
cmpn7dfeb00007gc5zh6vxlh2	Kitchenware	kitchenware	Pots, pans, utensils and cooking equipment	🍳	\N	\N	1	t
cmpn7dfff000d7gc5dogm9680	Plasticware	plasticware	Containers, baskets, buckets and plastic goods	🥤	\N	\N	2	t
cmpn7dfes00017gc5iktaom84	School Stationery	school-stationery	Books, pens, pencils and school supplies	✏️	\N	\N	3	t
cmpn7dfev00027gc57r977nlq	Hardware	hardware	Tools, fasteners and building materials	🔧	\N	\N	4	t
cmpn7dfex00037gc5w8q8eh3q	Baby Necessities	baby-necessities	Diapers, wipes, formula and baby care	👶	\N	\N	5	t
cmpn7dfez00047gc5rhg7ttch	Electric Gadgets	electric-gadgets	Cables, batteries, chargers and accessories	⚡	\N	\N	6	t
cmpn7dff000057gc53xaus5fo	Daily Necessities	daily-necessities	Groceries, cleaning and everyday essentials	🛒	\N	\N	7	t
cmpn7dff200067gc5llpyeil7	Careerday Uniforms	careerday-uniforms	School uniforms and career-day outfits	👔	\N	\N	8	t
cmpn7dff400077gc548bsgph3	Birthday Party Items	birthday-party-items	Balloons, decorations, gifts and party supplies	🎂	\N	\N	9	t
cmpn7dff600087gc5jr8ubbgr	Swimming Items	swimming-items	Swimwear, goggles, floats and pool accessories	🏊	\N	\N	10	t
cmpn7dff800097gc5gfp34or1	Bicycles	bicycles	Bikes, helmets and cycling accessories	🚲	\N	\N	11	t
cmpn7dffa000a7gc5shz4gp73	Home Improvement	home-improvement	Paint, fixtures, fittings and renovation supplies	🏠	\N	\N	12	t
cmpn7dffb000b7gc5uqze6etv	Toys	toys	Educational toys, games and playthings	🪀	\N	\N	13	t
\.


--
-- TOC entry 5206 (class 0 OID 239053)
-- Dependencies: 233
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, type, value, "minOrder", "maxUses", "usedCount", "expiresAt", "isActive", "createdAt", "updatedAt") FROM stdin;
cmpvab144000fokc5lwcx43tq	GODY07	PERCENTAGE	80.00	\N	10	0	2026-07-17 14:00:00	t	2026-06-01 14:08:50.788	2026-06-01 14:08:50.788
cmppbyzlc00022kc5wg7kx461	TRYOUT	PERCENTAGE	50.00	14.00	4	2	2026-06-07 12:07:00	t	2026-05-28 10:08:51.121	2026-06-01 14:56:49.471
\.


--
-- TOC entry 5201 (class 0 OID 238679)
-- Dependencies: 228
-- Data for Name: hero_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hero_slides (id, tag, "tagBg", headline, sub, "ctaLabel", "ctaHref", "imageUrl", "bgFrom", "bgTo", "sortOrder", "isActive", "createdAt", "updatedAt", "ctaBg") FROM stdin;
cmpolozwy0016bwc5sje0gugx	⚡ Flash Deals	#a314d2	Everyday Essentials,\nUnbeatable Prices	Shop kitchenware, daily necessities & more — all under $5	Shop Deals	/shop	\N	#e7009b	#a015dd	0	t	2026-05-27 21:53:14.962	2026-05-28 12:12:05.132	#ffffff
cmpolozwy0017bwc5f02yvgk7	✨ New Arrivals	#9306e0	Fresh Stock\nJust Landed	New products added weekly across all categories	See New Arrivals	/shop	\N	#59058a	#a214e0	1	t	2026-05-27 21:53:14.962	2026-05-27 21:53:14.962	#FFFFFF
cmpolozwy0018bwc5j0do7jpp	📱 Mobile Money	#da16a6	EcoCash & InnBucks\nAccepted	Fast, secure checkout with Zimbabwe's favourite payment methods	Start Shopping	/shop	\N	#b01181	#f40ba6	2	t	2026-05-27 21:53:14.962	2026-05-27 21:53:14.962	#FFFFFF
\.


--
-- TOC entry 5204 (class 0 OID 238753)
-- Dependencies: 231
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newsletter_subscribers (id, email, "createdAt") FROM stdin;
\.


--
-- TOC entry 5199 (class 0 OID 238581)
-- Dependencies: 226
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "productName", "productSku", price, quantity, subtotal, "variantSnapshot") FROM stdin;
cmpv9e9sm0008okc5onymi0lf	cmpv9e9s00007okc54mf4g84w	cmps7o6tr000mbsc5fvh5g1uw	2-Tier Dish Rack	KW-006	8.00	1	8.00	\N
cmpv9e9sm0009okc5x79joili	cmpv9e9s00007okc54mf4g84w	cmps7o6to000lbsc5tc1x5qtw	Garlic Press	KW-005	3.00	1	3.00	\N
cmpv9e9sm000aokc5qhet8xf3	cmpv9e9s00007okc54mf4g84w	cmps6owfg0013zkc56mthadi5	Aluminium Foil	KW-003	2.00	1	2.00	\N
cmpv9e9sm000bokc5z591jd20	cmpv9e9s00007okc54mf4g84w	cmps6owf80012zkc5ujjwr4zf	Plate Sponge Multi-Purpose	KW-002	0.50	1	0.50	\N
\.


--
-- TOC entry 5198 (class 0 OID 238556)
-- Dependencies: 225
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "userId", "guestEmail", "guestPhone", status, "paymentStatus", "paymentMethod", "paymentRef", subtotal, "deliveryFee", discount, total, currency, "shippingAddress", notes, "createdAt", "updatedAt", "couponCode", "couponId") FROM stdin;
cmpo6gwta000300c52saao97o	DS-2026-000001	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	CONFIRMED	PENDING_VERIFICATION	ECOCASH	SANDBOX-ECO-1779893223503	77.50	0.00	0.00	77.50	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098439", "country": "Zimbabwe", "province": "Mashonaland West"}	\N	2026-05-27 14:47:03.455	2026-05-28 10:28:28.448	\N	\N
cmppg6ea400092kc5b7mjjp3t	DS-2026-000002	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	DELIVERED	PAID	CASH_ON_DELIVERY	\N	82.50	0.00	41.25	41.25	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098439", "country": "Zimbabwe", "province": "Mashonaland West"}	\N	2026-05-28 12:06:35.212	2026-05-29 08:22:56.7	TRYOUT	cmppbyzlc00022kc5wg7kx461
cmpquy2kf00010oc5qoc14ewa	DS-2026-000004	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	PENDING	PENDING_VERIFICATION	ECOCASH	SANDBOX-ECO-1780055267282	4.00	3.00	0.00	7.00	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098439", "country": "Zimbabwe", "province": "Mashonaland West"}	\N	2026-05-29 11:47:47.199	2026-05-29 11:47:47.285	\N	\N
cmpquzcaa00040oc5fobki9q1	DS-2026-000005	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	PENDING	PENDING_VERIFICATION	INNBUCKS	SANDBOX-INN-1780055326501	2.00	3.00	0.00	5.00	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098439", "country": "Zimbabwe", "province": "Masvingo"}	\N	2026-05-29 11:48:46.45	2026-05-29 11:48:46.502	\N	\N
cmpv9e9s00007okc54mf4g84w	DS-2026-000007	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	PENDING	UNPAID	CASH_ON_DELIVERY	\N	13.50	3.00	0.00	16.50	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "", "phone": "0788098439", "country": "Zimbabwe", "province": "Matabeleland North"}	\N	2026-06-01 13:43:22.368	2026-06-01 13:43:22.368	\N	\N
cmppg9nlv000g2kc5xvvre92s	DS-2026-000003	cmpnuvjxq0000d0c56zf7uwxb	\N	\N	DELIVERED	PAID	CASH_ON_DELIVERY	\N	23.00	0.00	11.50	11.50	USD	{"city": "Chinhoyi", "name": "Softwise", "email": "geral@softwise.ao", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098439", "country": "Zimbabwe", "province": "Mashonaland West"}	\N	2026-05-28 12:09:07.267	2026-06-02 22:26:28.476	TRYOUT	cmppbyzlc00022kc5wg7kx461
cmpqzzsab00068gc5fr8oljuo	DS-2026-000006	cmpqzybpl00038gc5vmr7lv1b	\N	\N	DELIVERED	PAID	CASH_ON_DELIVERY	\N	2.50	3.00	0.00	5.50	USD	{"city": "Chinhoyi", "name": "Ikeny Manuel", "email": "ikm.smson14@gmail.com", "line1": "Chinhoyi University of Technology", "line2": "Hostel D, room G25", "phone": "0788098438", "country": "Zimbabwe", "province": "Mashonaland West"}	\N	2026-05-29 14:09:05.267	2026-06-06 15:47:20.306	\N	\N
\.


--
-- TOC entry 5205 (class 0 OID 239033)
-- Dependencies: 232
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "productId", "groupName", value, sku, stock, "priceAdjust", "sortOrder", "createdAt") FROM stdin;
cmq14iex1001j80c5fpa8yt8f	cmq14iet3001i80c5rodcnfqu	Colour 	Red		10	3.00	0	2026-06-05 16:13:14.629
cmq14iex5001k80c51z6vz4ss	cmq14iet3001i80c5rodcnfqu	Colour	Blue		10	3.00	1	2026-06-05 16:13:14.633
cmq14iex6001l80c5m9tleyl0	cmq14iet3001i80c5rodcnfqu	Colour 	White		10	3.00	2	2026-06-05 16:13:14.634
\.


--
-- TOC entry 5195 (class 0 OID 238506)
-- Dependencies: 222
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, sku, price, "compareAtPrice", stock, "lowStockAlert", images, tags, "categoryId", featured, "isActive", weight, "createdAt", "updatedAt") FROM stdin;
cmps6owei000vzkc5spyjrxyz	Tricycles	tricycles		BI-001	35.00	\N	20	10	{/uploads/1780646018142-ujrqp3qawx.png}	{tricycles,kids}	cmpn7dff800097gc5gfp34or1	t	t	\N	2026-05-30 10:04:20.874	2026-06-05 07:54:18.187
cmps6owds000qzkc5h6vlr4yn	Doctor Set	doctor-set	Complete toy doctors set including stethoscope and accessories.	TY-006	4.00	\N	80	10	{/uploads/1780666048626-lenixyt1dgj.jpg}	{doctor,set}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-05-30 10:04:20.848	2026-06-05 13:27:58.115
cmps6owdo000pzkc564to5vk1	Doctors Set	doctors-set	White doctor's coat for career day and role-play activities.	CU-001	6.00	\N	60	10	{/uploads/1780669779642-k7tt3bhz1rj.jpg}	{doctor,set,tools}	cmpn7dff200067gc5llpyeil7	t	t	\N	2026-05-30 10:04:20.844	2026-06-05 14:32:59.325
cmps6owe0000rzkc5wtcza8qa	Engineer Tools	engineer-tools	Toy engineer tool set for career day role-play.	CU-003	5.00	\N	70	10	{/uploads/1780670013608-8xblryvf9jr.jpg}	{engineer,tools,uniform}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:04:20.856	2026-06-05 14:33:44.776
cmps6owea000tzkc58fks0h9y	Balloons	balloons	Standard party balloons in assorted colours.	BP-002	1.00	\N	400	10	{/uploads/1780672206647-z2wwo54axi.png}	{balloons,party}	cmpn7dff400077gc548bsgph3	f	t	\N	2026-05-30 10:04:20.866	2026-06-05 15:10:12.363
cmps6owe6000szkc5ywakh93u	Balloons Pack of 10 Colourful Balloons	balloons-pack-of-10-colourful	Pack of 10 assorted colourful balloons for parties and celebrations.	BP-001	1.00	\N	500	10	{https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80&auto=format&fit=crop}	{balloons,party,colourful}	cmpn7dff400077gc548bsgph3	t	f	\N	2026-05-30 10:04:20.862	2026-06-05 15:11:05.502
cmps6owee000uzkc569f35qed	Swimming Floating Vest	swimming-floating-vest	Buoyancy vest to keep children safe and afloat while learning to swim.	SW-001	5.00	\N	60	10	{/uploads/1780675798166-vm262z616s.jpg}	{swimming,float,vest,safety}	cmpn7dff600087gc5jr8ubbgr	t	t	\N	2026-05-30 10:04:20.87	2026-06-05 16:10:28.329
cmps6owcl000jzkc5gwicf1at	Sound Flashing Ball for Babies	sound-flashing-ball-for-babies	Colourful ball with lights and sounds to stimulate baby senses.	BN-001	1.50	\N	80	10	{/uploads/1780677699118-mxfwbukne.jpg}	{baby,toy,sensory}	cmpn7dfex00037gc5w8q8eh3q	t	t	\N	2026-05-30 10:04:20.805	2026-06-05 16:41:44.567
cmps6owcp000kzkc5631ls48l	Baby Soothers	baby-soothers	Soft silicone soothers to comfort and calm your baby.	BN-002	2.00	\N	150	10	{/uploads/1780677733960-vz6c2ycrm8.jpg}	{baby,soother,dummy}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-05-30 10:04:20.809	2026-06-05 16:42:22.229
cmps6owcu000lzkc5nw2c7p8v	Rattle	rattle	Lightweight baby rattle to encourage play and motor skills.	BN-003	1.00	\N	120	10	{/uploads/1780677758052-l59birc0zr.jpg}	{baby,rattle,toy}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-05-30 10:04:20.814	2026-06-05 16:42:44.197
cmps6owdh000ozkc5mzbblxbr	Garment Steamer	garment-steamer	Handheld garment steamer to remove creases quickly and safely.	EG-003	9.80	\N	35	10	{/uploads/1780678521167-x0zc0jybd1q.jpg}	{steamer,garment,appliance}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-05-30 10:04:20.837	2026-06-05 16:58:20.451
cmps6owda000nzkc53gee1kda	Juice Blender 2 in 1	juice-blender-2in1	Versatile 2-in-1 blender and juicer for smoothies and fresh juice.	EG-002	20.00	\N	30	10	{/uploads/1780678722868-sfg4c3ccd7q.jpg}	{blender,juicer,appliance}	cmpn7dfez00047gc5rhg7ttch	t	t	\N	2026-05-30 10:04:20.83	2026-06-05 16:58:50.776
cmps6owcz000mzkc5gvdlmza9	Heavy Duty Electro Master Iron	heavy-duty-electro-master-iron	Powerful heavy-duty steam iron for wrinkle-free clothes.	EG-001	18.00	\N	40	10	{/uploads/1780678754059-5jv0qz8laxr.jpg}	{iron,appliance,electric}	cmpn7dfez00047gc5rhg7ttch	t	t	\N	2026-05-30 10:04:20.819	2026-06-05 16:59:19.666
cmps6owb3000dzkc5td29xbm5	Wax Crayons	wax-crayons	Vibrant wax crayons for drawing and colouring.	SS-001	2.00	\N	200	10	{/uploads/1780682976071-kvb587953xn.jpg}	{crayons,art,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-05-30 10:04:20.751	2026-06-05 18:09:44.533
cmps6owbd000ezkc5srqo6qid	Diary Notebook	diary-notebook	Lined diary notebook for daily writing and journalling.	SS-002	2.00	\N	150	10	{/uploads/1780683001121-za0276wig4s.jpg}	{diary,notebook,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-05-30 10:04:20.761	2026-06-05 18:10:15.549
cmps6owbm000fzkc5hni86q1y	Happiness Diary	happiness-diary	A motivational diary to record your thoughts and happiness.	SS-003	2.00	\N	100	10	{/uploads/1780683031246-26bsrqboma8.jpg}	{diary,journal,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-05-30 10:04:20.771	2026-06-05 18:10:40.227
cmps6owcd000izkc5ste4c49m	Electric Tape	electric-tape	Insulating electric tape for wiring and cable management. Price on enquiry.	HW-003	2.00	\N	200	10	{/uploads/1780696784340-zgbqa5agi4k.jpg}	{tape,electrical,hardware}	cmpn7dfev00027gc57r977nlq	f	t	\N	2026-05-30 10:04:20.797	2026-06-05 22:00:10.832
cmps6owc6000hzkc53rk7jvpz	Paint Brush	paint-brush	Durable paint brush suitable for walls and surfaces.	HW-002	2.00	\N	120	10	{/uploads/1780696833016-h3zgmkyxhnh.jpg}	{paint,brush,hardware}	cmpn7dfev00027gc57r977nlq	f	t	\N	2026-05-30 10:04:20.79	2026-06-05 22:00:45.277
cmps6owby000gzkc5nwj70pyq	All Size Spanners Set	all-size-spanners-set	Complete set of spanners in all standard sizes.	HW-001	10.00	\N	50	10	{/uploads/1780696882421-yktqa9eegkh.jpg}	{spanners,tools,hardware}	cmpn7dfev00027gc57r977nlq	t	t	\N	2026-05-30 10:04:20.782	2026-06-05 22:01:32.305
cmps7o6s40005bsc51k03hj95	Small Dish	small-dish	Small Dish	PW-008	1.00	\N	60	10	{/uploads/1780088212735-6k2imnuiere.jpg}	{dish,bowl,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.284	2026-05-30 10:31:47.284
cmps7o6s80006bsc5umkrta26	Kids Chair	kids-chair	Kids Chair	PW-009	3.00	\N	20	10	{/uploads/1780088262256-h96l4w1drje.jpg}	{chair,kids,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.288	2026-05-30 10:31:47.288
cmps7o6sc0007bsc5a740jkmx	Pink 12 Inch Bike	pink-12-inch-bike	Pink 12 Inch Bike	BI-004	55.00	\N	29	10	{/uploads/1780088408487-279diwvrre2.jpg}	{bicycle,pink,"12 inch",kids}	cmpn7dff800097gc5gfp34or1	t	t	\N	2026-05-30 10:31:47.292	2026-05-30 10:31:47.292
cmps7o6ta000gbsc5rls40yxt	Pilot Costume	pilot-costume	Pilot Costume	CU-006	14.00	\N	15	10	{/uploads/1780079462186-bb8ernyvrk.png}	{pilot,costume,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.326	2026-05-30 10:31:47.326
cmps7o6td000hbsc57b2982jy	Firefighter Costume	firefighter-costume	Firefighter Costume	CU-007	12.00	\N	20	10	{/uploads/1780079522673-tx9wn1c8fmk.png}	{firefighter,costume,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.329	2026-05-30 10:31:47.329
cmps7o6tl000kbsc58idlxhyk	Sponge Scourer Set	sponge-scourer-set	Sponge Scourer Set	KW-004	1.00	\N	150	10	{/uploads/1780079777489-uy0i2yna5de.jpg}	{sponge,scourer,cleaning}	cmpn7dfeb00007gc5zh6vxlh2	f	f	\N	2026-05-30 10:31:47.337	2026-06-04 11:39:51.261
cmps7o6u0000pbsc5ig5rju9l	Hand Mixer 7-Speed	hand-mixer-7-speed	Hand Mixer 7-Speed	KW-009	15.00	\N	25	10	{/uploads/1780080539971-gct898c6twq.jpg}	{mixer,"hand mixer","7 speed",appliance}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:31:47.352	2026-06-04 11:46:38.448
cmps7o6tx000obsc5inldl4bm	Portable Fruit Blender	portable-fruit-blender	Portable Juicer	KW-010	9.00	\N	30	10	{/uploads/1780080466787-vzfdoyyr2dg.jpg}	{juicer,portable,appliance}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:31:47.349	2026-06-04 11:47:47.367
cmps7o6ry0003bsc5adwsaza1	Good Quality Juice Bottles	good-quality-juice-bottles		PW-006	3.00	\N	20	10	{/uploads/1780088013844-emht9hgfzyr.jpg}	{bottles,plastic,water}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.278	2026-06-04 11:52:09.42
cmps7o6rv0002bsc5pvpilv49	Plastic Plates	plastic-plates		PW-005	3.00	\N	30	10	{/uploads/1780087952817-a5y5sv1a55r.jpg}	{plates,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.275	2026-06-04 11:53:29.817
cmps7o6s10004bsc5zcowj8aj	Plastic Pags	plastic-pags		PW-007	1.00	\N	20	10	{/uploads/1780087772051-8nj09r722n5.jpg}	{pags,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.281	2026-06-04 11:53:43.84
cmps7o6rs0001bsc5wulxxov3	Fridge Bottles	fridge-bottles	Fridge Bottles	PW-004	2.50	\N	50	10	{/uploads/1780081428730-gw3h5cdpi9b.jpg}	{fridge,bottle,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.272	2026-06-04 11:54:05.193
cmps7o6qx0000bsc5t5g56n3i	Big Washing Basket	big-washing-basket		PW-003	4.50	\N	100	10	{/uploads/1780574226205-67ifd9vcb45.jpg}	{basket,plastic,washing}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:31:47.241	2026-06-04 11:57:52.247
cmps7o6sm000absc5gly1c9ej	Middle Sized Bikes	middle-sized-bikes	Green Bike Ages 4-8	BI-007	65.00	\N	10	10	{/uploads/1780067272128-vlhn5jwrpf.jpg}	{bicycle,green,"ages 4-8"}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-05-30 10:31:47.302	2026-06-04 11:59:15.913
cmps7o6sj0009bsc5orec38ag	Bicycles for 6–13 Years	bicycles-for-613-years		BI-006	75.00	\N	10	10	{/uploads/1780067158007-6cic8vall5e.jpg}	{bicycle,pink}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-05-30 10:31:47.299	2026-06-04 12:00:23.381
cmps7o6sf0008bsc56bmg3u98	Bicycles	bicycles	16 Inch Bike	BI-005	65.00	\N	15	10	{/uploads/1780067117256-k3cum3byjd8.jpg}	{bicycle,"16 inch",kids}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-05-30 10:31:47.295	2026-06-04 12:01:04.599
cmps7o6t4000ebsc5holmi20p	Doctors Coat	doctors-coat	Doctor Costume	CU-004	12.00	\N	20	10	{/uploads/1780074447600-qf8r2p978q.png}	{doctor,costume,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.32	2026-06-05 14:34:23.754
cmps7o6tj000jbsc5mdh4dasp	Judge Costume/Outfit 	judge-costumeoutfit	Lawyer Costume	CU-009	25.00	\N	15	10	{/uploads/1780078210639-j657y5h60a8.png}	{lawyer,costume,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.335	2026-06-05 14:35:45.734
cmps7o6t7000fbsc54flrh4va	Engineer Suit/Coat	engineer-suitcoat	Engineer Uniform	CU-005	24.00	\N	20	10	{/uploads/1780075412541-3wul715by9o.png}	{engineer,uniform,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.323	2026-06-05 14:37:23.53
cmps7o6tf000ibsc59eoipj47	Police Costume	police-costume	Police Costume	CU-008	28.00	\N	20	10	{/uploads/1780079613765-5ujkw7jxxtu.png}	{police,costume,careerday}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-05-30 10:31:47.331	2026-06-05 14:38:11.325
cmps7o6t1000dbsc52syswwyg	Confetti Balloons Pack of 10	confetti-balloons-pack-of-10	Confetti Balloons Pack of 10	BP-003	1.00	\N	200	10	{/uploads/1780067350581-cfoqbav2j5e.jpg}	{balloons,confetti,party,"10 pack"}	cmpn7dff400077gc548bsgph3	f	t	\N	2026-05-30 10:31:47.317	2026-06-05 15:10:51.284
cmps7o6sx000cbsc5220cn8k1	Baby Teether	baby-teether	Baby Teether	BN-005	5.00	\N	100	10	{/uploads/1780677799757-3b7ibsp498q.jpg}	{baby,teether,"bpa free"}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-05-30 10:31:47.313	2026-06-05 16:43:51.496
cmps7o6st000bbsc5ojjm8p8e	Baby Wipes	baby-wipes		BN-004	1.00	\N	80	10	{/uploads/1780677874921-2b8js8jtfhl.jpg}	{baby}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-05-30 10:31:47.309	2026-06-05 16:45:15.224
cmps7o6tu000nbsc56ehkwp4p	Juice Blender	juice-blender	Blender 2 in 1 450W	KW-008	15.00	\N	25	10	{/uploads/1780080022134-179gkq8yma5.jpg}	{blender,"2 in 1",450w,appliance}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:31:47.346	2026-06-05 16:54:27.597
cmps7o6u9000sbsc5sn64k9c5	Squishy Animal Toys	squishy-animal-toys	Squishy Animal Toys	TY-001	2.00	\N	60	10	{/uploads/1780066974757-98vnwdlw7at.jpg}	{squishy,animal,toy}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-05-30 10:31:47.361	2026-05-30 10:31:47.361
cmps6owf40011zkc57em0h8wm	Plate Sponge	plate-sponge	Plate sponge used to wash plates. Tough on grease, gentle on surfaces.	KW-001	1.00	\N	250	10	{/uploads/1780138048798-88hhxea7a36.jpg}	{sponge,dishes,cleaning}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:04:20.896	2026-05-30 10:47:45.659
cmps7o6tr000mbsc5fvh5g1uw	2-Layer Dish Drainer	2-layer-dish-drainer	Used to hold drip easily after washing your plates and other kitchen utensils.	KW-006	10.00	\N	29	10	{/uploads/1780080388365-6tk0vkxxgo5.jpg}	{"dish rack",drying,kitchen}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:31:47.343	2026-06-04 11:38:50.144
cmps6owen000wzkc528kjxqav	Black Bike Knight Rider	black-bike-knight-rider	Full-size children's bicycle suitable for ages 6 to 13 years.	BI-002	20.00	\N	15	10	{/uploads/1780645851843-a2ge30w5nfk.jpg}	{bicycle,kids,black,knight}	cmpn7dff800097gc5gfp34or1	t	t	\N	2026-05-30 10:04:20.879	2026-06-05 07:51:45.994
cmps6owf80012zkc5ujjwr4zf	Plate Sponge Multi-Purpose	plate-sponge-multi-purpose	Multi-purpose sponge for cleaning plates, pots, and pans.	KW-002	0.50	\N	299	10	{/uploads/1780138088973-e8mp7fyipm.jpg}	{sponge,multipurpose,cleaning}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:04:20.9	2026-06-01 13:43:22.422
cmps7o6to000lbsc5tc1x5qtw	Garlic Crusher	garlic-crusher	Used for crushing garlic and other cooking ingredients.	KW-005	2.00	\N	79	10	{/uploads/1780080314277-htlju8mk5m.jpg}	{garlic,press,kitchen}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:31:47.34	2026-06-04 11:32:56.166
cmps6owfg0013zkc56mthadi5	Aluminium Foil	aluminium-foil	Heavy-duty aluminium foil for cooking, freezing, and wrapping.	KW-003	2.00	\N	179	10	{/uploads/1780572899507-onk1pinqxg.jpg}	{foil,cooking,kitchen}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-05-30 10:04:20.908	2026-06-04 11:35:09.442
cmpzfd03e000080c5rrqnchkq	Mesh Sponge	mesh-sponge	For scrubbing dirty pots.	KW-007	0.50	\N	30	10	{/uploads/1780573231061-7pt44r6w884.jpg}	{}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-06-04 11:41:25.562	2026-06-04 11:41:25.562
cmpzfn1ar000180c5frcn9rn4	365 Vim	365-vim		KW-011	1.00	\N	19	10	{/uploads/1780573727936-bbllylr295m.jpg}	{}	cmpn7dfeb00007gc5zh6vxlh2	f	t	\N	2026-06-04 11:49:13.683	2026-06-04 11:49:13.683
cmps6owfr0015zkc5ihb4bww5	Juice Bottle	juice-bottle	Durable plastic juice bottle for storing and serving cold drinks.	PW-002	3.00	\N	150	10	{/uploads/1780574104773-ubgaqd1vn9f.jpg}	{bottle,juice,drinks}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-05-30 10:04:20.919	2026-06-04 11:55:14.637
cmps6owfl0014zkc57mqx5sob	Water Bottle	water-bottle	Best-selling reusable water bottle with built-in straw.	PW-001	2.50	\N	200	10	{/uploads/1780574163104-qlxr1mph63e.jpg}	{bottle,water,straw}	cmpn7dfff000d7gc5dogm9680	t	t	\N	2026-05-30 10:04:20.913	2026-06-04 11:56:13.843
cmps6oweq000xzkc5hb3p5pqg	Bicycles for Adults	bicycles-for-adults	Reliable all-purpose bicycle for everyday use.	BI-003	110.00	\N	25	10	{/uploads/1780574520826-7o93jcfcok8.jpg}	{bicycle,standard}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-05-30 10:04:20.882	2026-06-04 12:02:39.123
cmq0n0otl000280c5f1gzacow	Bigger Bikes for Kids	bigger-bikes-for-kids	For kids with ages 6 - 14	BI-008	75.00	\N	20	10	{/uploads/1780646515337-fvfegibqfog.png}	{bicycles,kids,age}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-06-05 08:03:34.185	2026-06-05 08:03:34.185
cmq0n2pet000380c56jxdfnw8	Small Bikes	small-bikes	For kids with ages between 3 - 5	BI-009	55.00	\N	20	10	{/uploads/1780646625310-4x72a3nsqpk.png}	{small,bike,bicycles}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-06-05 08:05:08.261	2026-06-05 08:05:08.261
cmq0n4cih000480c5vee6na5l	Small Tricycles	small-tricycles		BI-010	25.00	\N	20	10	{/uploads/1780646718843-8nq9reti60k.png}	{tricycles,kids}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-06-05 08:06:24.858	2026-06-05 08:06:24.858
cmq0na0s1000580c5kj78uomi	Big Tricycles	big-tricycles	Tricycles with a pushing stick.	BI-011	45.00	\N	20	10	{/uploads/1780646869240-8fmcnu9du5c.jpg}	{tricycle,push,big}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-06-05 08:10:49.585	2026-06-05 08:10:49.585
cmq0ngvul000680c5otjvyqoj	Crolan Bicycle	crolan-bicycle		BI-012	98.00	\N	20	10	{/uploads/1780647082844-n2wujwdue5l.jpg}	{bicycles,crolan}	cmpn7dff800097gc5gfp34or1	f	t	\N	2026-06-05 08:16:09.789	2026-06-05 08:16:09.789
cmps7o6u7000rbsc5850hwu07	2 Door Portable Wardrobe	2-door-portable-wardrobe	Portable Wardrobe	HI-005	18.00	\N	20	10	{/uploads/1780131707841-vdxbaf6pp.jpg}	{wardrobe,closet,storage}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-05-30 10:31:47.359	2026-06-05 08:26:26.51
cmps7o6u3000qbsc5o0et1c6z	Window Cleaner Squeegee	window-cleaner-squeegee	Window Squeegee	HI-004	5.00	\N	50	10	{/uploads/1780131444858-skugknmgxj.jpg}	{window,squeegee,cleaning}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-05-30 10:31:47.355	2026-06-05 08:28:58.764
cmps6owf00010zkc5b4ewm1hx	Bamboo Pegs Set of 20	bamboo-pegs-set-of-20	Eco-friendly bamboo clothes pegs, set of 20.	HI-003	0.50	\N	300	10	{/uploads/1780648162609-3100e58oozg.jpg}	{pegs,bamboo,laundry}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-05-30 10:04:20.892	2026-06-05 08:29:38.638
cmps6owex000zzkc5pz4jkceg	Shoes Rack	shoes-rack	Compact shoes rack to keep your entryway tidy and organised.	HI-002	9.00	\N	40	10	{/uploads/1780648207815-d3w9c0hmjj.jpg}	{shoes,rack,organiser}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-05-30 10:04:20.889	2026-06-05 08:30:21.954
cmps6oweu000yzkc5v1eh8tb0	Toilet Brush	toilet-brush	Durable toilet brush for thorough toilet cleaning.	HI-001	2.50	\N	100	10	{/uploads/1780648260940-jxwwqzqtful.jpg}	{toilet,brush,cleaning}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-05-30 10:04:20.886	2026-06-05 08:31:22.637
cmq0o4dnp000780c5bjep8xpj	Household Gloves	household-gloves	Used when washing plates scrubbing the toilet and etc.	HI-006	1.00	\N	20	10	{/uploads/1780648326027-zqkj1wj9qsn.jpg}	{cleaning,gloves,household}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-06-05 08:34:25.958	2026-06-05 08:34:25.958
cmq0o7ykc000880c58gslmckx	Toilet Rack	toilet-rack	Used as an organizer for storing your towel, plants and etc.	HI-007	15.00	\N	20	10	{/uploads/1780648542230-ti0uc4l4p1d.jpg}	{toilet,rack,bathroom}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-06-05 08:37:13.02	2026-06-05 08:37:13.02
cmq0o9u0p000980c509ypz9cj	Metal Hangers	metal-hangers	To hang clothes.	HI-008	2.50	\N	20	10	{/uploads/1780648652301-4sieny8m5j.jpg}	{hanger,clothes}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-06-05 08:38:40.441	2026-06-05 08:38:40.441
cmq0oc8sl000a80c5v7n1j1zd	Portable Shoe Rack	portable-shoe-rack		HI-009	5.00	\N	20	10	{/uploads/1780648768060-hsy1sk2bq3.jpg}	{shoe,rack,portable,sleepers}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-06-05 08:40:32.901	2026-06-05 08:40:32.901
cmq0oegtz000b80c58d9427hv	Big Plastic Pags	big-plastic-pags		PW-010	2.00	\N	20	10	{/uploads/1780648876718-ocqur9zivz.jpg}	{pags,plastic}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-06-05 08:42:16.631	2026-06-05 08:42:16.631
cmq0oggii000c80c52xrmbzfq	Scrubbing Brush	scrubbing-brush	Used to when washing your shoes, hair and etc.	PW-011	1.00	\N	20	10	{/uploads/1780648949914-m8e1aa2o3v8.jpg}	{scrub,clean}	cmpn7dfff000d7gc5dogm9680	f	t	\N	2026-06-05 08:43:49.53	2026-06-05 08:43:49.53
cmq0oi8p2000d80c578hm1sug	Big Shoes Rack	big-shoes-rack		HI-010	15.00	\N	10	10	{/uploads/1780649045711-qkav1uekzz.jpg}	{shoe,home,interior,rack}	cmpn7dffa000a7gc5shz4gp73	f	t	\N	2026-06-05 08:45:12.71	2026-06-05 08:45:12.71
cmq0pprkf000e80c5ftxz1sj3	Remote Control Car	remote-control-car	With big wheels	TY-003	10.00	\N	20	10	{/uploads/1780651001161-ntg6vjzg58a.jpg}	{kids,car,control,remote}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 09:19:03.375	2026-06-05 09:19:03.375
cmq0xt4qv000f80c5w56zop1b	Big Doll House	big-doll-house		TY-004	40.00	\N	20	10	{/uploads/1780664663494-k2yihdpuo3b.png}	{toy,girl,big}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:05:37.352	2026-06-05 13:05:37.352
cmq0yhjqn000g80c5dkdooxb2	Skating Rings	skating-rings		TY-005	5.00	\N	20	10	{/uploads/1780665456502-ry0i12m526i.png}	{ring,skating}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:24:36.527	2026-06-05 13:24:36.527
cmq0yonl0000h80c5fcvuyzcz	Strong Doll	strong-doll		TY-007	10.00	\N	20	10	{/uploads/1780666169918-h5jpr08tyxq.jpg}	{girls,doll,strong}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:30:08.1	2026-06-05 13:30:08.1
cmq0zj7t1000i80c5qsz8ngn4	Doll With Beautiful Dress	doll-with-beautiful-dress		TY-008	7.00	\N	20	10	{/uploads/1780666288235-b1qul54cdbf.png}	{dress,dolls,girls,beautiful}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:53:53.989	2026-06-05 13:53:53.989
cmq0zkgeb000j80c5j5a3lwoj	Crawling Spiderman	crawling-spiderman		TY-009	8.00	\N	20	10	{/uploads/1780667647202-lho6zyklaos.jpg}	{spiderman,action,figure}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:54:51.779	2026-06-05 13:54:51.779
cmq0zmnud000k80c5ziq8wymv	Lovely Durable Doll with Long Hair	lovely-durable-doll-with-long-hair	Perfect present for your girl child	TY-010	20.00	\N	20	10	{/uploads/1780667709751-n7cnee3c9qn.png}	{doll,durable,hair,long}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:56:34.741	2026-06-05 13:56:34.741
cmq0znt66000l80c5ffq3wwih	Wallet Set	wallet-set		TY-011	2.00	\N	20	10	{/uploads/1780667818469-hhqbs24ajke.jpg}	{wallet}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:57:28.302	2026-06-05 13:57:28.302
cmq0zolp7000m80c57gi20wrz	Doll	doll		TY-012	5.00	\N	20	10	{/uploads/1780667863094-uqai2nbr5v.png}	{}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:58:05.275	2026-06-05 13:58:05.275
cmq0zphxv000n80c5h6zk0zf0	Long Gun	long-gun		TY-013	3.00	\N	20	10	{/uploads/1780667903931-dap2er8vom8.jpg}	{gun}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:58:47.059	2026-06-05 13:58:47.059
cmq0zqtco000o80c53ak6usyj	30 Seconds	30-seconds		TY-014	10.00	\N	20	10	{/uploads/1780667941750-vvcg8c2e5b.jpg,/uploads/1780667948902-lvf0ou6djyj.jpg}	{games,questions}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 13:59:48.504	2026-06-05 13:59:48.504
cmq0zt96j000p80c5swy2k99v	Superman	superman		TY-015	25.00	\N	20	10	{/uploads/1780668008943-o549anki0x.jpg}	{hero,action,figure}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:01:42.331	2026-06-05 14:01:42.331
cmq0zulfe000q80c5dfo0x2q3	Cute Black Doll	cute-black-doll		TY-016	9.00	\N	20	10	{/uploads/1780668130425-682im9aqxvt.png}	{doll,black,cute}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:02:44.859	2026-06-05 14:02:44.859
cmq0zvuz9000r80c5xsrj5vh8	Kitchen Set	kitchen-set		TY-017	3.00	\N	20	10	{/uploads/1780668179957-lsk9urb1xjp.png}	{kitchen,toy,girls,boys}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:03:43.893	2026-06-05 14:03:43.893
cmq0zx8tk000s80c5vaubbazm	Cute Durable Black Doll	cute-durable-black-doll		TY-018	22.00	\N	20	10	{/uploads/1780668248637-3zt8rowj1qc.png}	{black,doll,durable}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:04:48.488	2026-06-05 14:04:48.488
cmq0zy83i000t80c51dfou7vd	Stacking Rings	stacking-rings		TY-019	5.00	\N	20	10	{/uploads/1780668302130-5p1hn7qoto.jpg}	{stack,toy,rings}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:05:34.206	2026-06-05 14:05:34.206
cmq0zzur8000u80c5z0cj5euo	Counting Skip Rope	counting-skip-rope		TY-020	2.00	\N	20	10	{/uploads/1780668368349-9rn9qct014.jpg}	{jump,rope,exercise}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:06:50.228	2026-06-05 14:06:50.228
cmq101335000v80c5h9p1bfrt	Double Dolls	double-dolls		TY-021	20.00	\N	20	10	{/uploads/1780668434331-tiva8kbt6dk.jpg}	{twins,dolls}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:07:47.682	2026-06-05 14:07:47.682
cmq102nf2000w80c5bx7cc1vy	Construction Yellow Truck	construction-yellow-truck		TY-022	8.00	\N	20	10	{/uploads/1780668488894-srzhpkz3u7m.jpg}	{car,truck,yellow,construction}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:09:00.687	2026-06-05 14:09:00.687
cmq104bol000x80c5rtc2f4rc	Affordable Cute Doll	affordable-cute-doll		TY-023	5.00	\N	20	10	{/uploads/1780668565691-f6v2un35o3n.png}	{cute,doll}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:10:18.789	2026-06-05 14:10:18.789
cmq105lwf000y80c5xhkymxaf	Drums	drums		TY-024	25.00	\N	20	10	{/uploads/1780668640182-n9v34z1i5c.jpg}	{music,band,drums,beats}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:11:18.687	2026-06-05 14:11:18.687
cmq1089ix000z80c5gwlp8k20	Moving Paw Patrol on a Skateboard	moving-paw-patrol-on-a-skateboard	Battery operated.	TY-025	10.00	\N	20	10	{/uploads/1780668706753-cwyy2u90o8b.jpg,/uploads/1780668716087-llwhk3ga8ek.jpg}	{paw,patrol,skateboard}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:13:22.617	2026-06-05 14:13:22.617
cmq10a4fd001080c5pv9wcnc0	Boy Riding a Bike	boy-riding-a-bike	Battery operated	TY-026	12.00	\N	20	10	{/uploads/1780668831134-xb2j8vonpo.jpg}	{bike,ride}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:14:49.321	2026-06-05 14:14:49.321
cmq10bv36001180c53239mnax	Guitar	guitar		TY-027	7.00	\N	20	10	{/uploads/1780668928668-ibzmerg5cf.jpg}	{music,band,guitar}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:16:10.53	2026-06-05 14:16:10.53
cmq10dgr8001280c52fics9ap	Whistle	whistle		TY-028	0.50	\N	20	10	{/uploads/1780669007652-9ve8a3y7sfv.jpg}	{blow,whistle}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:17:25.268	2026-06-05 14:17:25.268
cmq10fu18001380c5ymkcoo0r	Sound Gun	sound-gun		TY-029	4.00	\N	20	10	{/uploads/1780669115890-n0liha3ium.jpg}	{gun,sound}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:19:15.788	2026-06-05 14:19:15.788
cmq10hrnk001480c5jaf8o89j	Kids Riding Bouncy Horse	kids-riding-bouncy-horse		TY-030	9.80	\N	20	10	{/uploads/1780669191133-gqcii7lcsbk.jpg}	{bounce,horse}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:20:46.016	2026-06-05 14:20:46.016
cmq10kl7y001580c5t2dc0387	Battery Operated Spiderman Bike	battery-operated-spiderman-bike	Moving Spiderman bike	TY-031	10.00	\N	20	10	{/uploads/1780669309204-8mztlxe89oq.jpg}	{spiderman,bike}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:22:57.646	2026-06-05 14:22:57.646
cmq10m651001680c58i7sj267	Phones for Kids	phones-for-kids		TY-032	3.00	\N	20	10	{/uploads/1780669407564-dcsrb6h221v.jpg}	{phones,kids,calls}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:24:11.413	2026-06-05 14:24:11.413
cmq10nl4w001780c5kcpeegu2	Play Tent	play-tent		TY-033	12.00	\N	20	10	{/uploads/1780669467496-0f5ol4wg5q2c.jpg}	{tent,camping}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:25:17.505	2026-06-05 14:25:17.505
cmq10phhj001880c57qr3ilbe	Simple Nice Remote Car	simple-nice-remote-car		TY-034	15.00	\N	20	10	{/uploads/1780669536601-wrgpohpgkdo.jpg}	{car,remote,control,ride}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:26:46.088	2026-06-05 14:26:46.088
cmq10qbk7001980c5aypbrowq	Zupco Bus	zupco-bus		TY-035	0.50	\N	20	10	{/uploads/1780669616499-q9uue5ycacn.jpg}	{bus}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-06-05 14:27:25.063	2026-06-05 14:27:25.063
cmps7o6ud000tbsc5ntbz2im1	Walkie Talkie	walkie-talkie	Kids Walkie Talkie	TY-002	5.00	\N	40	10	{/uploads/1780076490905-qtc6nlzmtm.jpg}	{"walkie talkie",toy,communication}	cmpn7dffb000b7gc5uqze6etv	f	t	\N	2026-05-30 10:31:47.365	2026-06-05 14:31:14.258
cmq115wk6001a80c5jf34tzvb	Chef Suit	chef-suit		CU-010	18.00	\N	20	10	{/uploads/1780670334927-h2o81j1ugd4.png}	{chef,uniform,career}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 14:39:32.118	2026-06-05 14:39:32.118
cmq1173ue001b80c5xuuv2alu	Nurse Scrubs	nurse-scrubs		CU-011	12.00	\N	20	10	{/uploads/1780670387549-po9r7rp84xk.png}	{nurse,uniform,scrub,career}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 14:40:28.214	2026-06-05 14:40:28.214
cmq118cb4001c80c5nc8vwgim	Binoculars	binoculars		CU-012	2.00	\N	20	10	{/uploads/1780670444954-ty37bb7oxx.jpg}	{vision}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 14:41:25.84	2026-06-05 14:41:25.84
cmq11ztxt001d80c5ir1u0e6u	Boots	boots		CU-013	4.00	\N	20	10	{https://m.media-amazon.com/images/I/616r39wn0BL.jpg,/uploads/1780671601831-93jrsgwaaye.jpg}	{boot}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 15:02:48.401	2026-06-05 15:02:48.401
cmq123yzw001f80c5bm3zfn6v	Yellow Vest	yellow-vest		CU-015	5.00	\N	20	10	{/uploads/1780671935021-nevlz2zxk6.png}	{uniform,vest}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 15:06:01.58	2026-06-05 15:06:01.58
cmq125cc8001g80c5pi023ktn	Pilot Suit	pilot-suit		CU-016	30.00	\N	20	10	{/uploads/1780671972087-t959760fbcn.png}	{uniform,career}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 15:07:05.528	2026-06-05 15:07:05.528
cmq1223to001e80c5vga7xgnu	Engineer's Suit - Worksuit	engineers-suit-worksuit		CU-014	12.00	\N	20	10	{/uploads/1780671797901-ehr117axlma.png}	{suit,uniform}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 15:04:34.524	2026-06-05 15:07:24.009
cmq127wwq001h80c5lph8ad09	Pilot Hat	pilot-hat		CU-017	10.00	\N	20	10	{/uploads/1780672099080-r64eu1t6faq.jpg}	{pilot,hat,uniform}	cmpn7dff200067gc5llpyeil7	f	t	\N	2026-06-05 15:09:05.498	2026-06-05 15:09:05.498
cmq14iet3001i80c5rodcnfqu	Silicon Swimming Hats	silicon-swimming-hats		SW-002	3.00	\N	30	10	{/uploads/1780675861177-vtvvfpjrbxq.jpg}	{swim,hats,pool}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:13:14.487	2026-06-05 16:13:14.487
cmq14k0n8001m80c5u1kai71v	Mini Swimming Pool for Kids	mini-swimming-pool-for-kids		SW-003	5.00	\N	20	10	{/uploads/1780676011859-ad8xxp34lm.jpg}	{pool,kids,swim}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:14:29.444	2026-06-05 16:14:29.444
cmq14lof3001n80c5gf8vappn	Inflatable Swimming Pool 	inflatable-swimming-pool		SW-004	40.00	\N	20	10	{/uploads/1780676083737-5wl28mcedq.jpg}	{big,pool,swim,inflate}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:15:46.911	2026-06-05 16:15:46.911
cmq14mo0v001o80c5fd5lcai5	Pool	pool		SW-005	5.00	\N	20	10	{/uploads/1780676166476-7a9rdlrh004.jpg}	{pool,swim}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:16:33.055	2026-06-05 16:16:33.055
cmq14obiw001p80c51ssep4sz	Swim Boards	swim-boards		SW-006	5.00	\N	20	10	{/uploads/1780676204080-ohk2u9ntdpf.jpg}	{board,pool,swim}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:17:50.168	2026-06-05 16:17:50.168
cmq14qdeb001q80c50u9y7pnv	Colorful Plastic Ball	colorful-plastic-ball		SW-007	1.00	\N	20	10	{/uploads/1780676295009-dli2oyat6yk.jpg,/uploads/1780676303290-5i4o047a1uc.jpg}	{ball,plastic,pool}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:19:25.907	2026-06-05 16:19:25.907
cmq14rhp0001r80c5syisata0	Inflatable Balls	inflatable-balls		SW-008	1.00	\N	20	10	{/uploads/1780676382742-n7xzfuumf2j.jpg}	{ball,inflate}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:20:18.132	2026-06-05 16:20:18.132
cmq14tffp001s80c5sfofmmjo	Colorful Swimming Ring for Kids	colorful-swimming-ring-for-kids	Protect your child from sinking.	SW-009	3.00	\N	21	10	{/uploads/1780676434270-rqyd94xlscp.jpg}	{protection,swim,pool,ring,kids}	cmpn7dff600087gc5jr8ubbgr	f	t	\N	2026-06-05 16:21:48.517	2026-06-05 16:21:48.517
cmq15pfef001t80c5xzk497z7	Baby Cotton Tissue	baby-cotton-tissue		BN-006	2.00	\N	20	10	{/uploads/1780677941216-l4bahhtepak.jpg}	{baby,wipe}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:46:41.463	2026-06-05 16:46:41.463
cmq15r6qs001u80c561efrvcn	Baby Pacifier	baby-pacifier		BN-007	1.00	\N	20	10	{/uploads/1780678046684-9ouiwu5yhi5.jpg}	{baby,chupeta}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:48:03.556	2026-06-05 16:48:03.556
cmq15rzb7001v80c5lu9jes9x	Teether	teether		BN-008	3.00	\N	20	10	{/uploads/1780678092746-kj8duudxrya.jpg}	{teether,baby}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:48:40.579	2026-06-05 16:48:40.579
cmq15t023001w80c5twkfr6z1	Baby Rattle	baby-rattle		BN-009	2.00	\N	20	10	{/uploads/1780678132857-9ytsndx4pz8.jpg}	{rattle,baby}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:49:28.203	2026-06-05 16:49:28.203
cmq15u7jp001x80c5g0vbpnza	Sleep Play Bed	sleep-play-bed		BN-010	28.00	\N	20	10	{/uploads/1780678186198-3ar8zq9wiy8.jpg}	{baby,bed,playful}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:50:24.565	2026-06-05 16:50:24.565
cmq15xa2y001y80c5cxyajgv9	Walker	walker		BN-011	25.00	\N	20	10	{/uploads/1780678285103-9w8eew85l7f.jpg}	{walker,baby}	cmpn7dfex00037gc5w8q8eh3q	f	t	\N	2026-06-05 16:52:47.818	2026-06-05 16:52:47.818
cmq166kha001z80c5o41mz4q3	Dry Iron	dry-iron		EG-004	10.00	\N	20	10	{/uploads/1780678769456-qddfskovrh.jpg}	{appliance,iron,clothes}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:00:01.198	2026-06-05 17:00:01.198
cmq168vs3002080c5whgu6e1k	Intelligent Light	intelligent-light	When electricity goes off, lights can continue for some time.	EG-005	2.00	\N	20	10	{/uploads/1780678816664-h7xl7egk71.jpg}	{light,power,save}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:01:49.155	2026-06-05 17:01:49.155
cmq16cwvi002180c5c838ebnv	M10 Earpods	m10-earpods		EG-006	4.00	\N	20	10	{https://s.alicdn.com/@sc04/kf/Hfa47d1cefa9e4bc2a09991e2f7c09c79t.png?avif=close&webp=close,/uploads/1780679028578-4gshsteyhe8.jpg}	{earpods}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:04:57.198	2026-06-05 17:04:57.198
cmq16l9xl002280c5x73cdtrm	USB Tube Light	usb-tube-light		EG-007	3.00	\N	20	10	{/uploads/1780679451244-t38qkzca0rl.jpg}	{usb,light}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:11:27.369	2026-06-05 17:11:27.369
cmq16ouyd002380c5pnuezyds	Hair Clipper	hair-clipper		EG-008	7.00	\N	20	10	{/uploads/1780679610139-c7asc6rw0bf.jpg}	{hair,cut,barber,clipper}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:14:14.581	2026-06-05 17:14:14.581
cmq16r28y002480c5fr09io58	Complete Haircutting & Touch Up Kit	complete-haircutting-touch-up-kit		EG-009	10.00	\N	20	10	{/uploads/1780679668602-gk8v73epvng.jpg}	{hair,barber,clipper,cut}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:15:57.346	2026-06-05 17:15:57.346
cmq16snxo002580c5b9rg8vyv	12V Tube Light Battery Use	12v-tube-light-battery-use		EG-010	2.00	\N	20	10	{/uploads/1780679781341-q7qmjw09gi.jpg}	{light,battery,tube}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:17:12.108	2026-06-05 17:17:12.108
cmq16u7r9002680c5mzrlr5jy	Vintage V9 Hair Clipper	vintage-v9-hair-clipper		EG-011	2.50	\N	20	10	{/uploads/1780679850164-tj1i86yow9i.jpg}	{clipper,hair,barbershop}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:18:24.453	2026-06-05 17:18:24.453
cmq16wi31002780c5hb0cns6x	Impulse Sealer	impulse-sealer	Seals all types of plastic paper. 	EG-012	35.00	\N	20	10	{/uploads/1780679923700-odg3oeu3zql.jpg}	{plastic,seal,packaging}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:20:11.149	2026-06-05 17:20:11.149
cmq16ypot002880c529l60hsu	Viva Spa Science Foot Exfoliator	viva-spa-science-foot-exfoliator	Exfoliates and polishes the feet.	EG-013	7.00	\N	20	10	{/uploads/1780680034040-e33bz26wywb.jpg}	{foot,spa,care,exfoliation}	cmpn7dfez00047gc5rhg7ttch	f	t	\N	2026-06-05 17:21:54.317	2026-06-05 17:21:54.317
cmq172csh002980c5eice55m1	Bathing Towels	bathing-towels		DN-001	1.00	\N	20	10	{/uploads/1780680240395-y9hlefb4llk.jpg}	{bath,towel,toilet,care}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:24:44.226	2026-06-05 17:24:44.226
cmq173z2s002a80c5rktov7l5	Bathing Sponge	bathing-sponge		DN-002	1.00	\N	20	10	{/uploads/1780680298383-lo6fkuu42e.jpg}	{sponge,bath,toilet}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:25:59.764	2026-06-05 17:25:59.764
cmq175kta002b80c57pca6d6z	Bathing Gloves	bathing-gloves		DN-003	0.50	\N	20	10	{/uploads/1780680393102-uvqflsojw2a.jpg}	{bath,care,shower}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:27:14.59	2026-06-05 17:27:14.59
cmq178pi8002c80c5lmaljm3z	Colgate Toothpaste	colgate-toothpaste		DN-004	1.00	\N	20	10	{https://io.convertiez.com.br/m/ramavicosmeticos/shop/products/images/19757/large/creme-dental-colgate-maxima-protecao-anticaries-180g_51186.jpg,/uploads/1780680449710-2xik1oulfng.jpg}	{brush,tooth,care}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:29:40.64	2026-06-05 17:29:40.64
cmq179ygd002d80c5040i6pun	Mini Bathing Sponge	mini-bathing-sponge		DN-005	0.50	\N	20	10	{/uploads/1780680592981-nwsyt1tij5d.jpg}	{bath,care,wash}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:30:38.893	2026-06-05 17:30:38.893
cmq17bqq8002e80c56pl7ick7	CloseUp Toothpaste	closeup-toothpaste		DN-006	1.50	\N	20	10	{/uploads/1780680665991-wd1446c0ef.jpg}	{tooth,brush,care,mouth}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:32:02.192	2026-06-05 17:32:02.192
cmq17ettr002g80c51olppsg0	Bathing Towels 1	bathing-towels-1		DN-007	2.00	\N	20	10	{/uploads/1780680746939-mnxmomsfxxs.jpg}	{towel,bath,shower,clean,care}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:34:26.175	2026-06-05 17:34:26.175
cmq17h8wn002h80c5jjftb8al	Meno's Body Wash	menos-body-wash		DN-008	2.00	\N	30	10	{/uploads/1780680929580-m9nv8nzpqd.jpg}	{wash,care,bath}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:36:19.031	2026-06-05 17:36:19.031
cmq17jkkl002i80c5s28cqvu3	Multipurpose Cleaning Towel Pack of 5	multipurpose-cleaning-towel-pack-of-5	You can use it for dirty surfaces, wipe away dust and etc.	DN-009	1.00	\N	30	10	{/uploads/1780680992454-uvaa0rxdlpp.jpg}	{towel,clean}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:38:07.461	2026-06-05 17:38:07.461
cmq17lsz3002j80c5l1vfxtte	Soft Care Sanitary Pads	soft-care-sanitary-pads		DN-010	1.00	\N	20	10	{/uploads/1780681116279-ntcgkkahk0m.jpg}	{pads,woman,care,soft}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:39:51.663	2026-06-05 17:39:51.663
cmq1gtzq9000hgwc5ruoun9ti	Seal Tape	seal-tape		SS-020	2.00	\N	20	10	{/uploads/1780696668812-9j3yrn6kjhs.jpg}	{tape}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:58:10.209	2026-06-05 21:58:10.209
cmq17n5jx002k80c5vu4ii1ef	Soft Bathing sponge	soft-bathing-sponge		DN-011	0.50	\N	30	10	{/uploads/1780681204697-rq2i14wuu2e.jpg}	{sponge}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:40:54.621	2026-06-05 17:54:59.314
cmq1876hp002l80c55dvogcbi	Panty Liners	panty-liners		DN-012	1.80	\N	20	10	{/uploads/1780682123788-10vylkjpp6zf.jpg}	{girls,panty,liners,period}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:56:28.957	2026-06-05 17:56:28.957
cmq189ahb002m80c5snhjiay2	Facial Tissue	facial-tissue	Portable tissue pack, you can carry everywhere.	DN-013	1.00	\N	20	10	{/uploads/1780682200411-l9wmp8qxj.jpg}	{clean,hygiene,facial,tissue}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:58:07.439	2026-06-05 17:58:07.439
cmq18aozn002n80c5y77jyt5l	Maval Girls Panty Liners	maval-girls-panty-liners		DN-014	0.60	\N	20	10	{/uploads/1780682298458-v4ejucauq3.jpg}	{period,girls,liners}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 17:59:12.9	2026-06-05 17:59:12.9
cmq18bu7i002o80c5gzboneyr	Perfume for Men	perfume-for-men		DN-015	2.00	\N	30	10	{/uploads/1780682370028-iuoz61u92yf.jpg}	{smell,perfume,care}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:00:06.318	2026-06-05 18:00:06.318
cmq18cwho002p80c5ce0ff9mi	Shower Cap	shower-cap		DN-016	0.50	\N	20	10	{/uploads/1780682419335-88cod54z0x7.jpg}	{shower,bath,cap}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:00:55.932	2026-06-05 18:00:55.932
cmq18e51o002q80c5ptqmv2mz	Hair Remover	hair-remover		DN-017	0.50	\N	20	10	{/uploads/1780682468947-5ayuk1mhnmx.jpg}	{hygiene,hair,treatment}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:01:53.676	2026-06-05 18:01:53.676
cmq18fg8d002r80c5mkjeguid	Reusable Shower Cap	reusable-shower-cap		DN-018	1.00	\N	20	10	{/uploads/1780682535519-ia7f3moj7z.jpg}	{shower,cap,care,bath}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:02:54.829	2026-06-05 18:02:54.829
cmq18h5vh002s80c556bqxoly	Perfume for Women	perfume-for-women		DN-019	2.00	\N	20	10	{/uploads/1780682611373-5d939rkw9dt.jpg}	{smell,perfume}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:04:14.717	2026-06-05 18:04:14.717
cmq18jw06002t80c526ye7yeu	Vimbai Body Wash 2L	vimbai-body-wash-2l		DN-020	3.00	\N	20	10	{/uploads/1780682667913-4urunjxhrz7.jpg}	{cleaning,wash,bath,hygiene,care}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:06:21.894	2026-06-05 18:06:21.894
cmq18kuow002u80c5xh6xf8y2	Vimbai Body Wash 750ml	vimbai-body-wash-750ml		DN-021	2.00	\N	30	10	{/uploads/1780682795114-0hx0txb8usj4.jpg}	{}	cmpn7dff000057gc53xaus5fo	f	t	\N	2026-06-05 18:07:06.848	2026-06-05 18:07:06.848
cmq19oyjd0000gwc5lvbf3ysr	Paper Puncher	paper-puncher		SS-004	3.00	\N	20	10	{/uploads/1780684655574-y2k7f2wdp2n.jpg}	{paper,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:38:18.073	2026-06-05 18:38:18.073
cmq1a2ifm0001gwc5ukee26kb	Pencil Sharpener	pencil-sharpener		SS-005	0.50	\N	20	10	{/uploads/1780684983241-wncfd1cedu.jpg}	{school,pencil,sharpener}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:48:50.386	2026-06-05 18:48:50.386
cmq1a4c700002gwc55vvmfbvs	Eversharp Pens 15M	eversharp-pens-15m		SS-006	0.25	\N	30	10	{/uploads/1780685346358-r0rry1qfgqs.jpg}	{pen,school,write}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:50:15.612	2026-06-05 18:50:15.612
cmq1a5i770003gwc5yn4k2iq8	Clip Board	clip-board		SS-007	3.00	\N	20	10	{/uploads/1780685433659-6atbtmazm1.jpg}	{board,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:51:10.052	2026-06-05 18:51:10.052
cmq1a6nug0004gwc5bv9b3rcn	Kids Diary	kids-diary		SS-008	3.00	\N	20	10	{/uploads/1780685487642-shzjjstdx2g.jpg}	{diary,notebook,write}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:52:04.024	2026-06-05 18:52:04.024
cmq1a7n530005gwc5907cjge2	Pocket File	pocket-file		SS-009	1.00	\N	20	10	{/uploads/1780685538906-dzp5b0qhb4s.jpg}	{file,pocket}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:52:49.767	2026-06-05 18:52:49.767
cmq1a9jx90007gwc57k3oyxa5	Painting Brush	painting-brush		SS-010	1.00	\N	20	10	{/uploads/1780685600121-y5fdj6d3qg.jpg}	{painting,school,brush}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 18:54:18.909	2026-06-05 18:54:18.909
cmq1ggdq70008gwc59v9jm8qw	LCD Writing Panel	lcd-writing-panel		SS-011	2.00	\N	30	10	{/uploads/1780696001669-g2345lddmoo.jpg}	{interaction,school,panel,lcd}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:47:35.167	2026-06-05 21:47:35.167
cmq1ghpfh0009gwc568qcw6uk	Pencil	pencil		SS-012	0.10	\N	20	10	{/uploads/1780696086706-3zx6xf52009.jpg}	{pencil,writing}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:48:36.989	2026-06-05 21:48:36.989
cmq1giywp000agwc5qy5bzfms	Sorting Puzzle	sorting-puzzle		SS-013	2.00	\N	30	10	{/uploads/1780696132299-5kvjevdtxa5.jpg}	{puzzle,sort,shapes}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:49:35.929	2026-06-05 21:49:35.929
cmq1gm8sk000bgwc5wakzxgpl	Pack of Pencils	pack-of-pencils		SS-014	1.00	\N	20	10	{/uploads/1780696286913-l1kdipmas5.png}	{schools,pencil}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:52:08.708	2026-06-05 21:52:08.708
cmq1gntlu000cgwc539iopwut	Space Management Notebook	space-management-notebook		SS-015	3.00	\N	20	10	{/uploads/1780696359441-vwmgrcm2xv.jpg}	{notebook,manage,write}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:53:22.338	2026-06-05 21:53:22.338
cmq1gorap000dgwc5jp2h2jn5	Eraser	eraser		SS-016	0.50	\N	20	10	{/uploads/1780696418101-6ptxzqus685.jpg}	{eraser,school}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:54:06.001	2026-06-05 21:54:06.001
cmq1gpxvs000egwc5q4rtpt8p	Small Diary	small-diary		SS-017	1.00	\N	20	10	{/uploads/1780696468203-m4btm9gfq7l.jpg}	{diary,notebook}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:55:01.192	2026-06-05 21:55:01.192
cmq1gsct2000fgwc5wxeamarg	Kids Blocks	kids-blocks		SS-018	4.50	\N	20	10	{/uploads/1780696564925-eo6m7eh4bep.jpg,/uploads/1780696535483-ei1k61hwph.jpg}	{building,blocks,kid,puzzle}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:56:53.846	2026-06-05 21:56:53.846
cmq1gtbc7000ggwc5xg5yisai	100 Counting Sticks	100-counting-sticks		SS-019	1.00	\N	20	10	{/uploads/1780696628601-mp3gso7lg1.jpg}	{sticks}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:57:38.599	2026-06-05 21:57:38.599
cmq1gv3f1000igwc5jw6403ow	Flexible Ruler	flexible-ruler		SS-021	1.00	\N	18	10	{/uploads/1780696701750-2esok930ska.jpg}	{school,measurements,ruler}	cmpn7dfes00017gc5iktaom84	f	t	\N	2026-06-05 21:59:01.645	2026-06-05 21:59:01.645
cmq1gzsmz000jgwc5epvcp4s5	Rolling Paint Brush	rolling-paint-brush		HW-004	2.00	\N	30	10	{/uploads/1780696912912-8pt2u9bu0zn.jpg}	{painting,brush,rolling}	cmpn7dfev00027gc57r977nlq	f	t	\N	2026-06-05 22:02:40.955	2026-06-05 22:02:40.955
\.


--
-- TOC entry 5203 (class 0 OID 238729)
-- Dependencies: 230
-- Data for Name: promo_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promo_cards (id, amount, label, "desc", sub, href, "leftBg", "rightBg", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmpolozx6001dbwc51u7ogoxm	NEW	IN	Fresh Arrivals	Shop what's new	/shop	bg-(--color-primary)	bg-(--color-primary-light)	2	t	2026-05-27 21:53:14.97	2026-05-27 21:53:14.97
cmpolozx6001cbwc5klhdc2uj	FREE	SHIP	Orders Over $15	Every order	/shop	bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)	bg-(--color-accent-light)	1	t	2026-05-27 21:53:14.97	2026-05-27 21:53:14.97
cmpolozx6001bbwc5hxkzad0o	30%	OFF	Daily Necessities	Limited time	/shop/daily-necessities	bg-(--color-accent)	bg-(--color-primary-light)	0	t	2026-05-27 21:53:14.97	2026-06-02 15:13:50.948
cmpolozx6001ebwc52tg9hmv4	⚡	FLASH	Flash Deals Today	While stocks last	/shop	bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)	bg-(--color-primary-light)	3	t	2026-05-27 21:53:14.97	2026-06-02 15:13:53.902
\.


--
-- TOC entry 5200 (class 0 OID 238596)
-- Dependencies: 227
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "userId", "productId", rating, comment, "isVisible", "createdAt") FROM stdin;
\.


--
-- TOC entry 5202 (class 0 OID 238706)
-- Dependencies: 229
-- Data for Name: side_promos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.side_promos (id, label, headline, href, "imageUrl", "bgFrom", "bgTo", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmpolozx3001abwc5lkhsnme9	PAY YOUR WAY	EcoCash &\nInnBucks	/checkout	\N	#a214e0	#e30199	1	t	2026-05-27 21:53:14.967	2026-05-28 10:19:21.43
cmpolozx30019bwc5rs14n06c	HOT DEALS	Up to 30% Off\nDaily Necessities	/shop/daily-necessities	\N	#e00297	#a214e0	0	t	2026-05-27 21:53:14.967	2026-06-02 15:13:43.586
\.


--
-- TOC entry 5192 (class 0 OID 238459)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, phone, "passwordHash", role, "emailVerified", "createdAt", "updatedAt") FROM stdin;
cmpmzdi6i0012ekc5mgwru04h	admin@dollarshop.co.zw	Dollar Shop Admin	\N	$2b$12$irLVtulYPiEswFjezXIHPeNkV4jTXC0p5wSXp5zICvHSgZyeTRxPi	ADMIN	\N	2026-05-26 18:40:41.034	2026-05-26 18:40:41.034
cmpnuvjxq0000d0c56zf7uwxb	geral@softwise.ao	Softwise	0788098439	$2b$12$iOdc1OUsbZ5d/IYuSTIrY.spFK07kVwSw6nULKf8zO0HVbr4.N1sa	CUSTOMER	\N	2026-05-27 09:22:31.214	2026-05-27 09:22:31.214
cmpqp4ps50016psc5lk3s4lpe	dev@dollarshop.co.zw	Dollar Shop Developer	\N	$2b$12$8Sba6MwT9QjZoXmingiuwuFyoxLnr3BSRK6RYu7C9qblugTanxg9a	SUPER_ADMIN	\N	2026-05-29 09:04:59.525	2026-05-29 09:04:59.525
cmpqzybpl00038gc5vmr7lv1b	ikm.smson14@gmail.com	Ikeny Manuel	\N	\N	CUSTOMER	2026-05-29 14:07:57.128	2026-05-29 14:07:57.129	2026-05-29 14:07:57.129
cmpwdu30m0000q8c5f7zsyn91	silasbleck18@gmail.com	Silas Manuel	\N	\N	CUSTOMER	2026-06-02 08:35:24.737	2026-06-02 08:35:24.742	2026-06-02 08:35:24.742
\.


--
-- TOC entry 5197 (class 0 OID 238544)
-- Dependencies: 224
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (id, "userId", "productId", "createdAt") FROM stdin;
cmpwh58sl0001q8c56n6d4c68	cmpnuvjxq0000d0c56zf7uwxb	cmps7o6sc0007bsc5a740jkmx	2026-06-02 10:08:04.293
cmpwrlg9j0007akc5dmplvgo0	cmpnuvjxq0000d0c56zf7uwxb	cmps6owei000vzkc5spyjrxyz	2026-06-02 15:00:36.631
\.


--
-- TOC entry 4993 (class 2606 OID 238491)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 239382)
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 238543)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 238505)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 239070)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 238705)
-- Name: hero_slides hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 238763)
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 238595)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 238580)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5024 (class 2606 OID 239052)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 238530)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 238751)
-- Name: promo_cards promo_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_cards
    ADD CONSTRAINT promo_cards_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 238610)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 238728)
-- Name: side_promos side_promos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.side_promos
    ADD CONSTRAINT side_promos_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 238472)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 238555)
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 1259 OID 238612)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5025 (class 1259 OID 239071)
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- TOC entry 5020 (class 1259 OID 238764)
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- TOC entry 5006 (class 1259 OID 238616)
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 4999 (class 1259 OID 238614)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5000 (class 1259 OID 238613)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5013 (class 1259 OID 238617)
-- Name: reviews_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON public.reviews USING btree ("userId", "productId");


--
-- TOC entry 4989 (class 1259 OID 238611)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 5005 (class 1259 OID 238615)
-- Name: wishlist_items_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON public.wishlist_items USING btree ("userId", "productId");


--
-- TOC entry 5030 (class 2606 OID 238618)
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5033 (class 2606 OID 238633)
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5034 (class 2606 OID 238638)
-- Name: cart_items cart_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5035 (class 2606 OID 239072)
-- Name: cart_items cart_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5031 (class 2606 OID 238623)
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5040 (class 2606 OID 238658)
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5041 (class 2606 OID 238663)
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5038 (class 2606 OID 239077)
-- Name: orders orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5039 (class 2606 OID 238653)
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5044 (class 2606 OID 239082)
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 238628)
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5042 (class 2606 OID 238673)
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5043 (class 2606 OID 238668)
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5036 (class 2606 OID 238648)
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5037 (class 2606 OID 238643)
-- Name: wishlist_items wishlist_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-06-08 15:51:32

--
-- PostgreSQL database dump complete
--

\unrestrict qCkse5QKJtElN0U5brMKv7YmgPec46je9gLdktKEIPx1lN7hEzXb28abuwYGUwf

