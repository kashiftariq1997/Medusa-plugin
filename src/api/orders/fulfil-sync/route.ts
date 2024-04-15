import { EntityManager } from "typeorm";
import {
  Fulfillment,
  FulfillmentService,
  MedusaRequest, MedusaResponse, Order, OrderService
} from "@medusajs/medusa";
import { ShopifyFulfillment, ShopifyOrder } from "../../../types";
import { getOrderFulfillmentData, transformShopifyOrderToOrderData, transformShopifyOrderToUpdateOrder } from "../../../utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const OrderRepository = manager.getRepository(Order)
    const orderService = req.scope.resolve<OrderService>("orderService");
    const FulfillmentRepository = manager.getRepository(Fulfillment)
    const fulfillmentService = req.scope.resolve<FulfillmentService>("fulfillmentService");
    const shopifyOrder: ShopifyOrder = req.body;
    console.log(">>>>>>>>>> Fulfil ORDER ")

    if (shopifyOrder) {
      const existingOrder = await OrderRepository.findOne({ where: { external_id: shopifyOrder.id.toString() } });

      if (existingOrder) {
        const existingFulfillment = await FulfillmentRepository.findOne({ where: { order_id: existingOrder.id } })

        if (existingFulfillment) {
          await FulfillmentRepository.update(existingFulfillment.id, { tracking_numbers: shopifyOrder.fulfillments[0].tracking_numbers })
        }
      } else {
        console.log(">>>>>>>>>> Not existing so creating new!")
        const transformed = await transformShopifyOrderToOrderData(shopifyOrder, manager);

        // typeOrm mutation to feed data into database
        const newOrder = OrderRepository.create(transformed);
        const save = await OrderRepository.save(newOrder)

        if (save) {
          console.log(`********* Order with ${shopifyOrder.id} synced | Creating Fulfillment **********`)

          Promise.all(
            shopifyOrder.fulfillments.map(fulfill => {
              const fulfillment = getOrderFulfillmentData(save.id, fulfill, manager)
            }))

          return
        } else {
          console.log(`********* Failed to save Order with ${shopifyOrder.id} **********`)
          res.status(400)
          return
        }
      }
    }
  } catch (error) {
    console.log(`********* Order with ${req.body.id} failed to sync for fulfillment  **********`)
    console.error(error);
    res.status(500).json({ message: 'Error processing Shopify order', error });
  }
}

async function createNewFulfill(orderId: string, shopifyFulfillment: ShopifyFulfillment) {

}