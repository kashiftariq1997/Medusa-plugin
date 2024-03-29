import { MedusaRequest, MedusaResponse, Product, ProductService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { ShopifyProduct } from "../../../types";
import { transformShopifyProductToUpdateProduct } from "../../../utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const data = req.body;

  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const ProductRepository = manager.getRepository(Product)
    const productService = req.scope.resolve<ProductService>("productService");
    const shopifyProduct: ShopifyProduct = req.body

    if(shopifyProduct.id){
      const existingProduct = await ProductRepository.findOne({ where: { external_id: shopifyProduct.id.toString() } });

      if (existingProduct) {
        const transformedProduct = await transformShopifyProductToUpdateProduct(shopifyProduct, manager);
        console.log("******* ", existingProduct)
        const updatedProduct = await productService.update(existingProduct.id, transformedProduct);

        if(updatedProduct){
          res.status(200).json({ product: updatedProduct });
          return
        } else {
          console.log(`********* Failed to save Order with ${shopifyProduct.id} **********`)
          res.status(400).json({ product: {} });
          return
        }
      }

      console.log(`*************** Product with External ID ${shopifyProduct.id} NOT exist ***************`)
      res.status(404).json({ product: {} });
    }
  } catch (error) {
    console.log("************ Error in Single Product Add Sync ***********")
    console.log(error)
    res.status(500).json({ product: null});
  }
}