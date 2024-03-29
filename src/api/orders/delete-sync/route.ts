import { MedusaRequest, MedusaResponse, Order } from "@medusajs/medusa";
import { EntityManager } from "typeorm";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.body;
  const manager: EntityManager = req.scope.resolve("manager")
  const OrderRepository = manager.getRepository(Order)
  console.log(">>>>>>>>>> DELETE ORDER ", id)
  try {
    if(id){
      await OrderRepository.delete({ external_id: id })

      console.log("************ Deleted Order Synced with Shopify ***********")
      res.status(200);
    } else {
      console.log("************ Deleted Order failed to Sync with Shopify ***********")
      res.status(404);
    }
  } catch (error) {
    console.log("************ Error in Order Delete Sync ***********")
    console.log(error)
    res.status(500);
  }
}
