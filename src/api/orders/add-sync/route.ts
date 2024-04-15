import { EntityManager } from "typeorm";
import {
  MedusaRequest, MedusaResponse, Order
} from "@medusajs/medusa";
import { ShopifyOrder } from "../../../types";
import { transformShopifyOrderToOrderData } from "../../../utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const OrderRepository = manager.getRepository(Order)
    const shopifyOrder: ShopifyOrder = req.body;
    console.log(">>>>>>>>>> ADD NEW ORDER ")
    if(shopifyOrder){
      const existingOrder = await OrderRepository.findOne({ where: { external_id: shopifyOrder.id.toString() }});

      if (!existingOrder) {
        const transformedOrder = await transformShopifyOrderToOrderData(shopifyOrder, manager);

        try {
          // typeOrm mutation to feed data into database
          const newOrder = OrderRepository.create(transformedOrder);
          const save = await OrderRepository.save(newOrder)

          if(save){
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
        console.log(`********* Order with ${shopifyOrder.id} already existed  **********`)
      }
    }
  } catch (error) {
    console.log(`********* Order with ${req.body.id} failed to sync  **********`)
    console.error(error);
    res.status(500).json({ message: 'Error processing Shopify order', error });
  }
}
