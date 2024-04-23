import { Fulfillment, Order, Product, TransactionBaseService, LineItem, TrackingLink } from '@medusajs/medusa';
import Shopify from 'shopify-api-node'
import { Option, ShopifyProduct } from '../types';
import { parseLineItems } from '../utils';

export default class ShopifyService extends TransactionBaseService {
  private shopify: Shopify;

  constructor(container: any) {
    super(container);

    this.shopify = new Shopify({
      shopName: process.env.SHOPIFY_SHOP_NAME,
      apiKey: process.env.SHOPIFY_API_KEY,
      password: process.env.SHOPIFY_PASSWORD
    })
  }

  async getShopifyProducts() {
    try {
      const response = await this.shopify.product.list();
      return { products: response, status: 200 }
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in getShopifyProducts >>>>>>>>>>>>")
      console.log(error)
      return { products: [], status: 500 }
    }
  }

  async getShopifyProduct(id: number): Promise<Shopify.IProduct> {
    try {
      return await this.shopify.product.get(id)
    } catch (error) {
      console.log("Failed to get Shopify product")
      return null;
    }
  }

  async getShopifyOrders() {
    try {
      const response = await this.shopify.order.list();
      return { orders: response, status: 200 }
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in getShopifyOrders >>>>>>>>>>>>")
      console.log(error)
      return { orders: [], status: 500 }
    }
  }

  async createProduct(medusaProduct: Product): Promise<Shopify.IProduct> {
    const {
      id, handle, options, status, title, description, images, thumbnail
    } = medusaProduct || {}

    const shopifyProduct = {
      title,
      body_html: description,
      handle,
      external_id: id,
      status: status === 'published' ? 'active' : 'draft',
      options: options as unknown as Option[],
      vendor: "Burton",
      images: images.map(image => image.url)
    }

    try {
      const product = await this.shopify.product.create(shopifyProduct)

      if(product){
        if(thumbnail){
          await this.shopify.productImage.create(product.id, { src: thumbnail })
        }
      }
      return product;
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async getProduct(id: number | string): Promise<Shopify.IProduct> {
    try {
      return await this.shopify.product.get(parseInt(id as string))
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async getProductImages(id: string): Promise<Shopify.IProductImage[]> {
    try {
      const product = await this.getProduct(id)

      if(product){
        return product.images
      }

      return null
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async updateProduct(medusaProduct: Product) {
    const {
      id, external_id, collection_id, handle, created_at, options, origin_country, status,
      title, type, description,
    } = medusaProduct || {}
    const shopifyProduct: Partial<ShopifyProduct> = {
      title,
      body_html: description,
      handle,
      status: status === 'published' ? 'active' : 'draft',
      options: options as unknown as Option[],
      vendor: "Burton"
    }

    try {
      const productResponse = await this.shopify.product.update(parseInt(external_id), shopifyProduct)
      return productResponse;
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in updateProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async deleteProduct(id: number) {
    try {
      await this.shopify.product.delete(id);
      console.log("*** Deleted Product synced with store ****")
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in deleteProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async deleteOrder(id: number) {
    try {
      await this.shopify.order.delete(id);
      console.log("*** Deleted Order synced with store ****")
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in deleteOrder >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async placeOrder(medusaOrder: Order, lineItems: LineItem[]): Promise<Shopify.IOrder> {
    const { tax_total, currency } = medusaOrder || {}
    const shopifyOrder = {
      total_tax: tax_total ?? 10,
      line_items: parseLineItems(lineItems, medusaOrder.external_id as unknown as number),
      currency: !!currency ? currency.code : "USD"
    }

    try {
      const response = await this.shopify.order.create(shopifyOrder);

      console.log("Place order response", response)
      return response;
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in placeOrder >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async updateOrder(medusaOrder: Order, lineItems: LineItem[]) {
    const { tax_total, currency, items, external_id } = medusaOrder || {}
    const shopifyOrder = {
      total_tax: tax_total ?? 10,
      line_items: parseLineItems(lineItems, medusaOrder.external_id as unknown as number),
      currency: !!currency ? currency.code : "USD"
    }

    try {
      const orderResponse = await this.shopify.order.update(parseInt(external_id), shopifyOrder)
      console.log("R E S P O S E ", orderResponse)
      return orderResponse;
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in updateOrder >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async addFulfilmentAndTracking(external_order_id: number, tracking: TrackingLink) {
    try {

      const trackingPayload = {
        line_items_by_fulfillment_order: [{ fulfillment_order_id: external_order_id }],
        tracking_info: {
          number: tracking.tracking_number,
          url: tracking.url || '',
          tracking_number: tracking.tracking_number
        }
      }

      const payload = {
        order_id: external_order_id,
        fulfillment: {
          message: "",
          notify_customer: false,
          tracking_info: {
            number: tracking.tracking_number,
            url: `"https://www.fedex.com/fedextrack/?trknbr=${tracking.tracking_number}`,
            company: "FedEx",
          },
          line_items_by_fulfillment_order: [
            {
              fulfillment_order_id: external_order_id,
              fulfillment_order_line_items: [],
            }
          ],
        }
      }
      console.log("1111111111", payload)
      console.log(JSON.stringify(payload))

      const updateOrder = await this.shopify.order.update(external_order_id, { fulfillment_status: 'fulfilled' })
      const order = await this.shopify.order.get(external_order_id, {
        fields: 'id,line_items,name,total_price,fullfillments'
      })

      const fulfillemnt = await this.shopify.fulfillment.createV2(JSON.stringify(payload))
      return fulfillemnt;

    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addFulfilmentAndTracking >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async cancelOrder(order: Order) {
    try {
      await this.shopify.order.cancel(order.external_id as unknown as number)
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in cancelOrder >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }
}
