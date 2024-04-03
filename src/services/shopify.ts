// import '@shopify/shopify-api/adapters/node';
// import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import { GetAllOrders, Option, ShopifyProduct } from '../types';
import { Product, TransactionBaseService} from '@medusajs/medusa';
import Shopify from 'shopify-api-node'
export default class ShopifyService extends TransactionBaseService {
  private shopify: Shopify;
  // private client: any;

  constructor(container: any) {
    super(container);
    // this.shopify = shopifyApi({
    //   apiKey: process.env.SHOPIFY_API_KEY,
    //   apiSecretKey: process.env.SHOPIFY_API_SECRET,
    //   apiVersion: LATEST_API_VERSION,
    //   isPrivateApp: true,
    //   scopes: ['read_products', 'read_orders', 'write_products', 'write_orders'],
    //   isEmbeddedApp: false,
    //   hostName: '127.0.0.1:7001'
    // });

    this.shopify = new Shopify({
      shopName: '383c42-2',
      apiKey: process.env.SHOPIFY_API_KEY,
      password: process.env.SHOPIFY_PASSWORD
    })
    // const sessionId = this.shopify.session.getOfflineId(process.env.SHOPIFY_DOMAIN)

    // const session = new Session({
    //   id: sessionId,
    //   shop: process.env.SHOPIFY_DOMAIN,
    //   state: 'state',
    //   isOnline: false,
    //   accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    // })

    // this.client = new this.shopify.clients.Request({ session: session })
  }

  async getShopifyProducts(){
    try {
      // const { body } = await this.client.get({
      //   path: 'products'
      // })

      // if(body){
        // const { products } = body

        // return { products, status: 200};
      // } else{
        return {products: [], status: 404}
      // }
    } catch (error) {
      return {products: [], status: 500}
    }
  }

  async getShopifyOrders(){
  //   try {
  //     const { body } = await this.client.get({
  //       path: 'orders'
  //     })

  //     if(body){
  //       const { orders } = body

  //       return { orders, status: 200};
  //     } else{
        return {orders: [], status: 404}
  //     }
  //   } catch (error) {
  //     console.log("<<<<<<<<<<<<<< Error in getShopifyOrders >>>>>>>>>>>>")
  //     console.log(error)
  //     return { orders: [], status: 500}
  //   }
  }

  async createProduct(medusaProduct: Product): Promise<Shopify.IProduct>{
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
      const productResponse = await this.shopify.product.create(shopifyProduct)
      return productResponse;
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in addProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }

  async updateProduct(medusaProduct: Product){
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

  async deleteProduct(id: string){
    try {
       return await this.shopify.product.delete(parseInt(id))
    } catch (error) {
      console.log("<<<<<<<<<<<<<< Error in deleteProduct >>>>>>>>>>>>")
      console.log(error.response.body.errors)
    }
  }
}
