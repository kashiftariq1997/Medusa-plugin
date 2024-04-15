import {
  ProductService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify";

export default async function productUpdateHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const productService: ProductService = container.resolve("productService");
  const shopifyService: ShopifyService = container.resolve("shopifyService")

  const { id, fields } = data || {}
  
  if(fields && fields.includes('external_id')) return;

  try {
    const product = await productService.retrieve(id)

    if(product){
      const shopifyProduct = await shopifyService.updateProduct(product)

      if(shopifyProduct){
        console.log("*** Product synced with shopify store ***")
      }
    }
  } catch (error) {
    console.log("********** Error in productUpdateHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: ProductService.Events.UPDATED,
  context: {
    subscriberId: "product-update-handler",
  },
}