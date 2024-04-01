import {
  ProductService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify";

export default async function productAddHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const productService: ProductService = container.resolve("productService");
  const shopifyService = container.resolve<ShopifyService>("shopifyService")

  const { id } = data

  try {
    const product = await productService.retrieve(id)

    if(product){
      const { status } = await shopifyService.createProduct(product)

      if(status === 200 || status === 201){
        console.log("Product synced with shopify store")
      }
    }
  } catch (error) {
    console.log("********** Error in productAddHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: ProductService.Events.CREATED,
  context: {
    subscriberId: "product-add-handler",
  },
}