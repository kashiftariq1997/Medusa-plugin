import { Order, Product, Region, Currency, OrderStatus, FulfillmentStatus, PaymentStatus, LineItem, Address, Discount, DiscountRuleType, ProductType, MedusaContainer, ProductTypeService, ProductStatus, ProductOption, ProductVariant, ProductTag, Customer } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { ShopifyProduct } from "../types";
import { CreateProductInput, UpdateProductInput } from "@medusajs/medusa/dist/types/product";

export async function transformShopifyOrderToOrderData(shopifyOrder: any, manager: EntityManager): Promise<Partial<Order>> {
  const RegionRepository = manager.getRepository(Region)
  const CurrencyRepository = manager.getRepository(Currency)

  const regions = await RegionRepository.find();
  const defaultRegion = regions[0]

  const currencies = await CurrencyRepository.find();
  const defaultCurrency = currencies[0]

  return {
    external_id: shopifyOrder.id.toString(),
    status: mapOrderStatus(shopifyOrder.financial_status),
    fulfillment_status: mapFulfillmentStatus(shopifyOrder.fulfillment_status),
    payment_status: mapPaymentStatus(shopifyOrder.financial_status), // Adjust based on your mapping
    currency_code: defaultCurrency.code,
    total: parseFloat(shopifyOrder.total_price),
    subtotal: parseFloat(shopifyOrder.subtotal_price),
    email: shopifyOrder.email,
    discounts: shopifyOrder.discount_applications?.map(mapDiscounts) ?? [],
    items: [],
    region_id: defaultRegion.id,
    region: defaultRegion,
    // billing_address: mapAddress(shopifyOrder.billing_address),
    // shipping_address: mapAddress(shopifyOrder.shipping_address),
    customer: mapCustomer(shopifyOrder.customer) as any,
    // Add other mappings here as necessary
    metadata: {}
  };
}

export async function transformShopifyProductToUpdateProduct(shopifyProduct: ShopifyProduct, manager: EntityManager): Promise<UpdateProductInput> {
    const ProductTypeRepository = manager.getRepository(ProductType)

    const {
        body_html, created_at, handle, id, image, images, options, product_type, published_at, published_scope,
        status, tags, template_suffix, title, updated_at, variants, vendor
    } = shopifyProduct

    // let productType: ProductType | null = null;

    // productType = await ProductTypeRepository.findBy({ value: product_type })
    return {
        title: title || '',
        subtitle: '',
        description: body_html,
        handle,
        is_giftcard: false,
        status: mapProductStatus(status),
        images: [],
        thumbnail: '',
        // options: [],
        // variants: variants as unknown as ProductVariant[],
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



export async function transformShopifyProductToProductData(shopifyProduct: ShopifyProduct, manager: EntityManager): Promise<CreateProductInput> {
    const ProductTypeRepository = manager.getRepository(ProductType)

    const {
        body_html, created_at, handle, id, image, images, options, product_type, published_at, published_scope,
        status, tags, template_suffix, title, updated_at, variants, vendor
    } = shopifyProduct

    // let productType: ProductType | null = null;

    // productType = await ProductTypeRepository.findBy({ value: product_type })
    return {
        title: title || '',
        subtitle: '',
        description: body_html,
        handle,

        is_giftcard: false,
        status: mapProductStatus(status),
        images: [],
        thumbnail: '',
        // options: [],
        // variants: variants as unknown as ProductVariant[],
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
          return OrderStatus.REQUIRES_ACTION; // Default case, adjust as needed
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
      variant_id: shopifyItem.variant_id.toString()  ?? '',
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
