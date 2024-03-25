import {
  type ProductService,
  type ScheduledJobConfig,
  type ScheduledJobArgs,
  ProductStatus,
  Order,
}  from "@medusajs/medusa"
import ShopifyService from "../services/shopify"
import { EntityManager } from "typeorm"

import {
  mapAddress, mapCustomer, mapDiscounts, mapFulfillmentStatus, mapLineItems,
  mapOrderStatus, mapPaymentStatus, transformShopifyOrderToOrderData
} from "../utils"

export default async function handler({
  container,
  data,
  pluginOptions,
}: ScheduledJobArgs) {
  try {
    const manager: EntityManager = container.resolve("manager")
    const OrderRepository = manager.getRepository(Order)

    const shopifyService: ShopifyService = container.resolve("shopifyService")
    const { orders, status } = await shopifyService.getShopifyOrders();

    if (status === 200) {
      await Promise.all(
        orders.map(async (shopifyOrder: any): Promise<Partial<Order>> => {
          if(shopifyOrder){
            const existingOrder = await OrderRepository.findOne({ where: { external_id: shopifyOrder.id.toString() }});

            if (!existingOrder) {
              const transformedOrder = await transformShopifyOrderToOrderData(shopifyOrder, manager);

              try {
                // typeOrm mutation to feed data into database
                const newOrder = OrderRepository.create(transformedOrder);
                const save = await OrderRepository.save(newOrder)

                if(save){
                  return newOrder
                } else {
                  console.log(`********* Failed to save Order with ${shopifyOrder.id} **********`)
                }
              } catch (error) {
                console.log(error)
              }
            } else {
              console.log(`*************** Order with External ID ${shopifyOrder.id} already exist ***************`)
            }

            return existingOrder;
          }

          return null;
        })
      );
    }
  } catch (error) {
    console.log("<<<<<<<<<<<<<< Error in Order job >>>>>>>>>>>>")
    console.log(error)
  }
}

export const config: ScheduledJobConfig = {
  name: "sync-orders-with-shopify-store",
  schedule:  "* * * * *",
  data: {},
}