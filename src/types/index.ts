type ApiStatus = { status: number }

interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id?: any;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason?: any;
  cancelled_at?: any;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: Clientdetails;
  closed_at?: any;
  confirmation_number?: any;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: Currentsubtotalpriceset;
  current_total_additional_fees_set?: any;
  current_total_discounts: string;
  current_total_discounts_set: Currentsubtotalpriceset;
  current_total_duties_set?: any;
  current_total_price: string;
  current_total_price_set: Currentsubtotalpriceset;
  current_total_tax: string;
  current_total_tax_set: Currentsubtotalpriceset;
  customer_locale?: any;
  device_id?: any;
  discount_codes: Discountcode[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status?: any;
  landing_site: string;
  landing_site_ref: string;
  location_id?: any;
  merchant_of_record_app_id?: any;
  name: string;
  note?: any;
  note_attributes: Noteattribute[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_additional_fees_set?: any;
  original_total_duties_set?: any;
  payment_gateway_names: string[];
  phone: string;
  po_number: string;
  presentment_currency: string;
  processed_at: string;
  reference: string;
  referring_site: string;
  source_identifier: string;
  source_name: string;
  source_url?: any;
  subtotal_price: string;
  subtotal_price_set: Currentsubtotalpriceset;
  tags: string;
  tax_exempt: boolean;
  tax_lines: Taxline[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: Currentsubtotalpriceset;
  total_line_items_price: string;
  total_line_items_price_set: Currentsubtotalpriceset;
  total_outstanding: string;
  total_price: string;
  total_price_set: Currentsubtotalpriceset;
  total_shipping_price_set: Currentsubtotalpriceset;
  total_tax: string;
  total_tax_set: Currentsubtotalpriceset;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id?: any;
  billing_address: Billingaddress;
  customer: Customer;
  discount_applications: Discountapplication[];
  fulfillments: Fulfillment[];
  line_items: Lineitem2[];
  payment_terms?: any;
  refunds: Refund[];
  shipping_address: Billingaddress;
  shipping_lines: Shippingline[];
}

interface Shippingline {
  id: number;
  carrier_identifier?: any;
  code: string;
  discounted_price: string;
  discounted_price_set: Currentsubtotalpriceset;
  phone?: any;
  price: string;
  price_set: Currentsubtotalpriceset;
  requested_fulfillment_service_id?: any;
  source: string;
  title: string;
  tax_lines: any[];
  discount_allocations: any[];
}

interface Refund {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  note: string;
  order_id: number;
  processed_at: string;
  restock: boolean;
  total_additional_fees_set: Currentsubtotalpriceset;
  total_duties_set: Currentsubtotalpriceset;
  user_id: number;
  order_adjustments: any[];
  transactions: Transaction[];
  refund_line_items: Refundlineitem[];
  duties: any[];
  additional_fees: any[];
}

interface Refundlineitem {
  id: number;
  line_item_id: number;
  location_id: number;
  quantity: number;
  restock_type: string;
  subtotal: number;
  subtotal_set: Currentsubtotalpriceset;
  total_tax: number;
  total_tax_set: Currentsubtotalpriceset;
  line_item: Lineitem2;
}
interface Transaction {
  id: number;
  admin_graphql_api_id: string;
  amount: string;
  authorization: string;
  created_at: string;
  currency: string;
  device_id?: any;
  error_code?: any;
  gateway: string;
  kind: string;
  location_id?: any;
  message?: any;
  order_id: number;
  parent_id: number;
  payment_id: string;
  processed_at: string;
  receipt: Originaddress;
  source_name: string;
  status: string;
  test: boolean;
  user_id?: any;
}
interface Lineitem2 {
  id: number;
  admin_graphql_api_id: string;
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status?: any;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: Currentsubtotalpriceset;
  product_exists: boolean;
  product_id: number;
  properties: Noteattribute[];
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: Currentsubtotalpriceset;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor?: any;
  tax_lines: Taxline[];
  duties: any[];
  discount_allocations: Discountallocation[];
}
interface Fulfillment {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  location_id: number;
  name: string;
  order_id: number;
  origin_address: Originaddress;
  receipt: Receipt;
  service: string;
  shipment_status?: any;
  status: string;
  tracking_company: string;
  tracking_number: string;
  tracking_numbers: string[];
  tracking_url: string;
  tracking_urls: string[];
  updated_at: string;
  line_items: Lineitem[];
}
interface Lineitem {
  id: number;
  admin_graphql_api_id: string;
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status?: any;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: Currentsubtotalpriceset;
  product_exists: boolean;
  product_id: number;
  properties: Noteattribute[];
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: Currentsubtotalpriceset;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor?: any;
  tax_lines: Taxline[];
  duties: any[];
  discount_allocations: Discountallocation[];
}
interface Discountallocation {
  amount: string;
  amount_set: Currentsubtotalpriceset;
  discount_application_index: number;
}
interface Receipt {
  testcase: boolean;
  authorization: string;
}
interface Originaddress {
}
interface Discountapplication {
  target_type: string;
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  code: string;
}
interface Customer {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  state: string;
  note?: any;
  verified_email: boolean;
  multipass_identifier?: any;
  tax_exempt: boolean;
  phone: string;
  email_marketing_consent: Emailmarketingconsent;
  sms_marketing_consent: Smsmarketingconsent;
  tags: string;
  currency: string;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: Defaultaddress;
}
interface Defaultaddress {
  id: number;
  customer_id: number;
  first_name?: any;
  last_name?: any;
  company?: any;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}
interface Smsmarketingconsent {
  state: string;
  opt_in_level: string;
  consent_updated_at: string;
  consent_collected_from: string;
}
interface Emailmarketingconsent {
  state: string;
  opt_in_level?: any;
  consent_updated_at: string;
}
interface Billingaddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string;
  company?: any;
  latitude: number;
  longitude: number;
  name: string;
  country_code: string;
  province_code: string;
}
interface Taxline {
  price: string;
  rate: number;
  title: string;
  price_set: Currentsubtotalpriceset;
  channel_liable?: any;
}
interface Noteattribute {
  name: string;
  value: string;
}
interface Discountcode {
  code: string;
  amount: string;
  type: string;
}
interface Currentsubtotalpriceset {
  shop_money: Shopmoney;
  presentment_money: Shopmoney;
}
interface Shopmoney {
  amount: string;
  currency_code: string;
}
interface Clientdetails {
  accept_language?: any;
  browser_height?: any;
  browser_ip: string;
  browser_width?: any;
  session_hash?: any;
  user_agent?: any;
}

export type GetAllOrders = ApiStatus & { orders: ShopifyOrder[]}
 // ----------------------------------------------------------------------

export interface ShopifyProduct {
  id: number
  title: string
  body_html: string
  vendor: string
  product_type: string
  created_at: string
  handle: string
  updated_at: string
  published_at: string
  template_suffix: any
  published_scope: string
  tags: string
  status: string
  admin_graphql_api_id: string
  variants: ProductVariant[]
  options: Option[]
  images: Image[]
  image: Image
}

export interface ProductVariant {
  id: number
  product_id: number
  title: string
  price: string
  sku: string
  position: number
  inventory_policy: string
  compare_at_price: any
  fulfillment_service: string
  inventory_management: string
  option1: string
  option2: any
  option3: any
  created_at: string
  updated_at: string
  taxable: boolean
  barcode: string
  grams: number
  image_id?: number
  weight: number
  weight_unit: string
  inventory_item_id: number
  inventory_quantity: number
  old_inventory_quantity: number
  presentment_prices: PresentmentPrice[]
  requires_shipping: boolean
  admin_graphql_api_id: string
}

export interface PresentmentPrice {
  price: Price
  compare_at_price: any
}

export interface Price {
  amount: string
  currency_code: string
}

export interface Option {
  id: number
  product_id: number
  name: string
  position: number
  values: string[]
}

export interface Image {
  id: number
  alt: any
  position: number
  product_id: number
  created_at: string
  updated_at: string
  admin_graphql_api_id: string
  width: number
  height: number
  src: string
  variant_ids: number[]
}
