import {
  ProductService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"

export default async function productDeleteHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const productService: ProductService = container.resolve(
    "productService"
  )

  const { id } = data

  const product = await productService.retrieve(id)

  // do something with the product...
}

export const config: SubscriberConfig = {
  event: ProductService.Events.DELETED,
  context: {
    subscriberId: "product-delete-handler",
  },
}