import { Product, TransactionBaseService } from '@medusajs/medusa';
import Shopify from 'shopify-api-node'
import { Option, ShopifyProduct } from '../types';

export default class ShopifyService extends TransactionBaseService {
  private shopify: Shopify;

  constructor(container: any) {
    super(container);

    this.shopify = new Shopify({
      shopName: '383c42-2',
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
      id, collection_id, handle, created_at, options, origin_country, status,
      title, type, description,
    } = medusaProduct || {}

    const shopifyProduct = {
      title,
      body_html: description,
      handle,
      external_id: id,
      status: status === 'published' ? 'active' : 'draft',
      options: options as unknown as Option[],
      vendor: "Burton"
    }

    try {
      return await this.shopify.product.create(shopifyProduct)
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
}
