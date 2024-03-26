import { MedusaRequest, MedusaResponse, Product } from "@medusajs/medusa";
import { EntityManager } from "typeorm";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.body;
  const manager: EntityManager = req.scope.resolve("manager")
  const ProductRepository = manager.getRepository(Product)

  try {
    if(id){
      await ProductRepository.delete({ external_id: id })
      res.status(200);
    } else {
      res.status(404);
    }
  } catch (error) {
    console.log("************ Error in Product Delete Sync ***********")
    console.log(error)
    res.status(500);
  }
}
