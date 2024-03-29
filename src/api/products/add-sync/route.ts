import { MedusaRequest, MedusaResponse, Product, ProductService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { ShopifyProduct } from "../../../types";
import { transformShopifyProductToProductData } from "../../../utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const ProductRepository = manager.getRepository(Product)
    const productService = req.scope.resolve<ProductService>("productService");
    const shopifyProduct: ShopifyProduct = req.body

    if(shopifyProduct.id){
      const existingProduct = await ProductRepository.findOne({ where: { external_id: shopifyProduct.id.toString() } });

      if (!existingProduct) {
        const transformedProduct = await transformShopifyProductToProductData(shopifyProduct, manager);

        const newProduct = await productService.create(transformedProduct);

        if(newProduct){
          res.status(200).json({ product: newProduct });
          return
        } else {
          console.log(`********* Failed to save Order with ${shopifyProduct.id} **********`)
          res.status(400).json({ product: {} });
          return
        }
      }

      console.log(`*************** Product with External ID ${shopifyProduct.id} already exist ***************`)
      res.status(302).json({ product: {} });
    }
  } catch (error) {
    console.log("************ Error in Single Product Sync ***********")
    console.log(error)
    res.status(500).json({ product: null});
  }
}
