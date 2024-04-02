import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import { GetAllOrders, Option, ShopifyProduct } from '../types';
import { Product, TransactionBaseService} from '@medusajs/medusa';

export default class ShopifyService extends TransactionBaseService {
  private shopify: any;
  private client: any;

  constructor(container: any) {
    super(container);
    this.shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      apiVersion: LATEST_API_VERSION,
      isPrivateApp: true,
      scopes: ['read_products', 'read_orders', 'write_products', 'write_orders'],
      isEmbeddedApp: false,
      hostName: '127.0.0.1:7001'
    });

    const sessionId = this.shopify.session.getOfflineId(process.env.SHOPIFY_DOMAIN)

    const session = new Session({
      id: sessionId,
      shop: process.env.SHOPIFY_DOMAIN,
      state: 'state',
      isOnline: false,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    })

    this.client = new this.shopify.clients.Rest({ session: session })
  }

  async getShopifyProducts(){
    try {
      const { body } = await this.client.get({
        path: 'products'
      })

      if(body){
        const { products } = body

        return { products, status: 200};
      } else{
        return {products: [], status: 404}
      }
    } catch (error) {
      return {products: [], status: 500}
    }
  }

  async getShopifyOrders(): Promise<GetAllOrders>{
    try {
      const { body } = await this.client.get({
        path: 'orders'
      })

      if(body){
        const { orders } = body

        return { orders, status: 200};
      } else{
        return {orders: [], status: 404}
      }
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in getShopifyOrders >>>>>>>>>>>>")
      console.log(error)
      return { orders: [], status: 500}
    }
  }

  async shpCreateProduct(medusaProduct: Product){
    const {
      id, external_id, collection_id, handle, created_at, options, origin_country, status,
      title, type, description,
    } = medusaProduct || {}
    const shopifyProduct: Partial<ShopifyProduct> = {
        body_html: description, options: options as unknown as Option[], handle, status,
        title
    }

    try {
      const { body, status } = await this.client.post({
        path: 'products',
        data: JSON.stringify(shopifyProduct)
      })

      return { status }
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error)
    }
  }

  async removeProductFromShopify(id: string){
    try {
      const { body, status } = await this.client.delete({
        path: 'products', id
      })

      return { status }
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error)
    }
  }
}
