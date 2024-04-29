import Shopify from "shopify-api-node";
import { EntityManager } from "typeorm";
import { UpdateOrderInput } from "@medusajs/medusa/dist/types/orders";
import { CreateCustomerInput } from "@medusajs/medusa/dist/types/customers";
import { ShopifyCustomer, ShopifyFulfillment, ShopifyOrder, ShopifyProduct } from "../types";
import {
  Order, Region, Currency, OrderStatus, FulfillmentStatus, PaymentStatus, LineItem, Address,
  Discount, DiscountRuleType, ProductStatus, Customer, Fulfillment
} from "@medusajs/medusa";
import {
  CreateProductInput, CreateProductProductOption, CreateProductProductVariantInput, UpdateProductInput
} from "@medusajs/medusa/dist/types/product";

export async function transformShopifyOrderToOrderData(
  shopifyOrder: ShopifyOrder, manager: EntityManager
): Promise<Partial<Order>> {
  const RegionRepository = manager.getRepository(Region)
  const CurrencyRepository = manager.getRepository(Currency)

  const regions = await RegionRepository.find();
  const defaultRegion = regions[0]

  const currencies = await CurrencyRepository.find();
  const defaultCurrency = currencies[0]

  const customer = await createOrFindCustomer(shopifyOrder.customer, manager);

  return {
    external_id: shopifyOrder.id.toString(),
    status: mapOrderStatus(shopifyOrder.financial_status),
    fulfillment_status: mapFulfillmentStatus(shopifyOrder.fulfillment_status),
    payment_status: mapPaymentStatus(shopifyOrder.financial_status), // Adjust based on your mapping
    currency_code: defaultCurrency.code,
    total: parseFloat(shopifyOrder.total_price),
    subtotal: parseFloat(shopifyOrder.subtotal_price),
    email: shopifyOrder.email ?? "test@test.com",
    discounts: shopifyOrder.discount_applications?.map(mapDiscounts) ?? [],
    items: [],
    region_id: defaultRegion.id,
    region: defaultRegion,
    // billing_address: mapAddress(shopifyOrder.billing_address),
    // shipping_address: mapAddress(shopifyOrder.shipping_address),
    // customer: mapCustomer(shopifyOrder.customer),
    ...(customer ? { customer_id: customer.id } : null)
    // Add other mappings here as necessary
  };
}

export async function transformShopifyOrderToUpdateOrder(shopifyOrder: ShopifyOrder, manager: EntityManager): Promise<UpdateOrderInput> {
  const customer = await createOrFindCustomer(shopifyOrder.customer, manager);

  return {
    // status: mapOrderStatus(shopifyOrder.financial_status) as any,
    // fulfillment_status: mapFulfillmentStatus(shopifyOrder.fulfillment_status) as any,
    // payment_status: mapPaymentStatus(shopifyOrder.financial_status) as any,
    discounts: shopifyOrder.discount_applications?.map(mapDiscounts) ?? [],
    email: shopifyOrder.email ?? "test@medusa.com",
    // items: [],
    ...(customer ? { customer_id: customer.id } : null)
    // billing_address: mapAddress(shopifyOrder.billing_address),
    // shipping_address: mapAddress(shopifyOrder.shipping_address),
  };
}

export function normalizeShopifyProductVariants(variants: Shopify.IProductVariant[]): CreateProductProductVariantInput[] {
  return variants.map(variant => {
    const { title, inventory_quantity, price } = variant || {}
    return {
      title,
      inventory_quantity,
      prices: [{ amount: parseInt(price) }]
    }
  })
}

export function normalizeShopifyProductOptions(options: Shopify.IProductOption[]): CreateProductProductOption[] {
  return options.map(option => {
    const { name } = option || {}
    return {
      title: name
    }
  })
}

export async function transformShopifyProductToProductData(shopifyProduct: Shopify.IProduct): Promise<CreateProductInput> {
  const {
    body_html, handle, id, image, images, options, status, title,
  } = shopifyProduct

  return {
    title: title || '',
    subtitle: '',
    description: body_html,
    handle,
    is_giftcard: false,
    status: mapProductStatus(status),
    images: images && images.length && images.map(image => image.src || ''),
    thumbnail: image && image.src || '',
    options: normalizeShopifyProductOptions(options),
    // variants: normalizeShopifyProductVariants(variants),
    // categories: [],
    // profile_id: '',
    weight: 10,
    length: 10,
    height: 10,
    width: 10,
    hs_code: '',
    origin_country: '',
    mid_code: '',
    material: '',
    // collection_id: '',
    type: null,
    // tags: [],
    discountable: true,
    external_id: id.toString(),
    // metadata: {},
    sales_channels: [],
  };
}

export function mapProductStatus(status: string): ProductStatus {
  switch (status) {
    case 'draft':
      return ProductStatus.DRAFT;
    case 'proposed':
      return ProductStatus.PROPOSED;
    case 'published':
    case 'active':
      return ProductStatus.PUBLISHED;
    case 'rejected':
      return ProductStatus.REJECTED;
    default:
      return ProductStatus.DRAFT; // Default case, adjust as needed
  }
}

export function mapOrderStatus(shopifyStatus: string): OrderStatus {
  switch (shopifyStatus) {
    case 'pending':
      return OrderStatus.PENDING;
    case 'paid':
      return OrderStatus.COMPLETED;
    case 'refunded':
      return OrderStatus.ARCHIVED;
    case 'voided':
      return OrderStatus.CANCELED;
    default:
      return OrderStatus.REQUIRES_ACTION;
  }
}

export function mapFulfillmentStatus(shopifyStatus: string | null): FulfillmentStatus {
  switch (shopifyStatus) {
    case null:
      return FulfillmentStatus.NOT_FULFILLED;
    case 'partial':
      return FulfillmentStatus.PARTIALLY_FULFILLED;
    case 'fulfilled':
      return FulfillmentStatus.FULFILLED;
    default:
      return FulfillmentStatus.REQUIRES_ACTION; // Adjust based on your logic
  }
}

export function mapPaymentStatus(shopifyStatus: string): PaymentStatus {
  switch (shopifyStatus) {
    case 'authorized':
    case 'pending':
      return PaymentStatus.AWAITING;
    case 'paid':
      return PaymentStatus.CAPTURED;
    case 'partially_refunded':
      return PaymentStatus.PARTIALLY_REFUNDED;
    case 'refunded':
      return PaymentStatus.REFUNDED;
    case 'voided':
      return PaymentStatus.CANCELED;
    default:
      return PaymentStatus.REQUIRES_ACTION;
  }
}

export function mapLineItems(shopifyItem: any): LineItem {
  return {
    product_id: shopifyItem.product_id.toString() ?? '',
    variant_id: shopifyItem.variant_id.toString() ?? '',
    quantity: shopifyItem.quantity,
    // Add additional fields as needed
  } as LineItem;
}

export function mapAddress(shopifyAddress: any): Address {
  return {
    first_name: shopifyAddress.first_name,
    last_name: shopifyAddress.last_name,
    address_1: shopifyAddress.address1,
    address_2: shopifyAddress.address2,
    city: shopifyAddress.city,
    province: shopifyAddress.province,
    country: shopifyAddress.country,
  } as Address;
}

export function mapCustomer(shopifyCustomer: any): Customer {
  return {
    customer_id: shopifyCustomer.id.toString() ?? "",
    email: shopifyCustomer.email,
    first_name: shopifyCustomer.first_name,
    last_name: shopifyCustomer.last_name,
  } as unknown as Customer;
}

export function mapDiscounts(shopifyDiscountApplication: any): Discount {
  let ruleType = DiscountRuleType.FIXED;

  if (shopifyDiscountApplication.type === 'percentage') {
    ruleType = DiscountRuleType.PERCENTAGE;
  } else if (shopifyDiscountApplication.type === 'shipping') {
    ruleType = DiscountRuleType.FREE_SHIPPING;
  }

  let ruleId = "";

  return {
    code: shopifyDiscountApplication.code,
    is_dynamic: false,
    rule_id: ruleId,
    rule: {
      type: ruleType,
    } as any,
    is_disabled: false,
    parent_discount_id: "",
    parent_discount: null,
    starts_at: new Date(),
    ends_at: null,
    valid_duration: null,
    usage_limit: shopifyDiscountApplication.usage_limit,
    usage_count: 0,
    metadata: {},
  } as unknown as Discount;
}


export async function createOrFindCustomer(shopifyCustomer: ShopifyCustomer, manager: EntityManager): Promise<Customer> {
  const CustomerRepository = manager.getRepository(Customer)

  if (!shopifyCustomer) {
    const customers = await CustomerRepository.find()

    return customers[0]
  }

  const customer = await CustomerRepository.findOne({ where: { email: shopifyCustomer.email } })

  if (customer) return customer
  const customerInput: CreateCustomerInput = {
    email: shopifyCustomer.email,
    first_name: shopifyCustomer.first_name ?? '',
    last_name: shopifyCustomer.last_name ?? ''
  }

  const newCustomer = CustomerRepository.create(customerInput)
  const savedCustomer = await CustomerRepository.save(newCustomer)

  return savedCustomer ?? null;
}

export async function getOrderFulfillmentData(
  orderId: string,
  shopifyFulfillment: ShopifyFulfillment,
  manager: EntityManager
): Promise<Fulfillment> {
  const FulfillmentRepository = manager.getRepository(Fulfillment)
  const { tracking_numbers, tracking_urls } = shopifyFulfillment || {}

  const fulfillment = FulfillmentRepository.create({
    data: {}, metadata: {}, tracking_numbers, order_id: orderId
  })

  const save = await FulfillmentRepository.save(fulfillment);

  return save ? save : null;
}

export function parseLineItems(items: LineItem[], order_external_id: number) {
  return items.map(item => {
    const {
      fulfilled_quantity, description, has_shipping, includes_tax, unit_price,
      is_return, is_giftcard, quantity, title
    } = item || {}

    return {
      fulfilled_quantity,
      order_id: order_external_id,
      description,
      has_shipping,
      includes_tax,
      unit_price,
      is_return,
      is_giftcard,
      quantity,
      title,
      price: unit_price / 100
    }
  })
}
