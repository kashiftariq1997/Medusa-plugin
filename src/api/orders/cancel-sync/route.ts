import { MedusaRequest, MedusaResponse, Order, OrderService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.body;
  const manager: EntityManager = req.scope.resolve("manager")
  const service: OrderService = req.scope.resolve("orderService")
  const OrderRepository = manager.getRepository(Order)
  console.log(">>>>>>>>>> Cancel ORDER ", id)
  try {
    if (id) {
      const order = await OrderRepository.findOne({ where: { external_id: id } });

      if (order) {
        await service.cancel(order.id )
        console.log("************ Canceled Order Synced with Shopify ***********")
        res.status(200);
        return
      }
    }

    console.log("************ Canceled Order failed to Sync with Shopify ***********")
    res.status(404);
  } catch (error) {
    console.log("************ Error in Order cancel Sync ***********")
    console.log(error)
    res.status(500);
  }
}
