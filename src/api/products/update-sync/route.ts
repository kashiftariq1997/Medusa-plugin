import { MedusaRequest, MedusaResponse, Product, ProductService } from "@medusajs/medusa";
import Shopify from "shopify-api-node";
import { EntityManager } from "typeorm";
import { transformShopifyProductToProductData } from "../../../utils";
import { UpdateProductInput } from "@medusajs/medusa/dist/types/product";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const data = req.body;

  try {
    const manager: EntityManager = req.scope.resolve("manager")
    const ProductRepository = manager.getRepository(Product)
    const productService = req.scope.resolve<ProductService>("productService");
    const shopifyProduct: Shopify.IProduct = req.body

    if (shopifyProduct.id) {
      const existingProduct = await ProductRepository.findOne({ where: { external_id: shopifyProduct.id.toString() } });

      if (existingProduct) {
        const transformedProduct = await transformShopifyProductToProductData(shopifyProduct);
        const updatedProduct = await productService.update(existingProduct.id, transformedProduct as UpdateProductInput);

        if (updatedProduct) {
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
    res.status(500).json({ product: null });
  }
}
