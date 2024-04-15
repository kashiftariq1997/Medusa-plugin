import { EntityManager } from "typeorm";
import {
  MedusaRequest, MedusaResponse, Order, OrderService
} from "@medusajs/medusa";
import { ShopifyOrder } from "../../../types";
import { transformShopifyOrderToOrderData, transformShopifyOrderToUpdateOrder } from "../../../utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const OrderRepository = manager.getRepository(Order)
    const orderService = req.scope.resolve<OrderService>("orderService");
    const shopifyOrder: ShopifyOrder = req.body;
    console.log(">>>>>>>>>> Update ORDER ")
    if (shopifyOrder) {
      const existingOrder = await OrderRepository.findOne({ where: { external_id: shopifyOrder.id.toString() } });

      if (existingOrder) {
        const transformedOrder = await transformShopifyOrderToUpdateOrder(shopifyOrder, manager);
        console.log("transformed ", transformedOrder)
        try {
          // typeOrm mutation to feed data into database
          const updatedOrder = await orderService.update(existingOrder.id, transformedOrder)

          if (updatedOrder) {
            console.log(`********* Order with ${shopifyOrder.id} synced **********`)
            res.status(200)
            return
          } else {
            console.log(`********* Failed to save Order with ${shopifyOrder.id} **********`)
            res.status(400)
            return
          }
        } catch (error) {
          console.log(error)
          console.log(`********* Order with ${req.body.id} failed to sync  **********`)
          res.status(500)
          return
        }
      } else {
        console.log(">>>>>>>>>> Not existing so creating new!")
        const transformed = await transformShopifyOrderToOrderData(shopifyOrder, manager);

        // typeOrm mutation to feed data into database
        const newOrder = OrderRepository.create(transformed);
        const save = await OrderRepository.save(newOrder)

        if (save) {
          console.log(`********* Order with ${shopifyOrder.id} synced **********`)
          res.status(200)
          return
        } else {
          console.log(`********* Failed to save Order with ${shopifyOrder.id} **********`)
          res.status(400)
          return
        }
      }
    }
  } catch (error) {
    console.log(`********* Order with ${req.body.id} failed to sync  **********`)
    console.error(error);
    res.status(500).json({ message: 'Error processing Shopify order', error });
  }
}
