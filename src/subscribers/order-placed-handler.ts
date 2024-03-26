import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"

export default async function orderPlacedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve(
    "orderService"
  )

  const { id } = data

  const order = await orderService.retrieve(id)

  // do something with the product...
}

export const config: SubscriberConfig = {
  event: OrderService.Events.PLACED,
  context: {
    subscriberId: "order-placed-handler",
  },
}