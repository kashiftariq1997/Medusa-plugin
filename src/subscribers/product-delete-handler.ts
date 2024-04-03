import {
  ProductService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"

export default async function productDeleteHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const productService: ProductService = container.resolve("productService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")

  const { external_id } = data
  try {
    if(external_id){
      await shopifyService.deleteProduct(external_id)
      console.log("Products are synced with store")
    }
  } catch (error) {
    console.log("********** Error in productDeleteHandler ********")
    console.log(error)
  }

}

export const config: SubscriberConfig = {
  event: ProductService.Events.DELETED,
  context: {
    subscriberId: "product-delete-handler",
  },
}