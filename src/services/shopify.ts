import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import { GetAllOrders } from '../types';

export default class ShopifyService {
  private shopify: any;
  private client: any;

  constructor() {
    this.shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY || "3d4cecfae97d81b024ccf7e98dc2f7f0",
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "b577fcc47f8e0c0d194d692b8bad8a94",
      apiVersion: LATEST_API_VERSION,
      isPrivateApp: true,
      scopes: ['read_products', 'read_orders'],
      isEmbeddedApp: false,
      hostName: '127.0.0.1:7001'
    });

    const sessionId = this.shopify.session.getOfflineId('383c42-2.myshopify.com')

    const session = new Session({
      id: sessionId,
      shop: '383c42-2.myshopify.com',
      state: 'state',
      isOnline: false,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "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",
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
      console.log("Fetching orders ......")
      console.log(" Client             -         ", this.client)
      const { body } = await this.client.get({
        path: 'orders'
      })
      console.log(body)
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
}