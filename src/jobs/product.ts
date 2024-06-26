import {
  type ProductService,
  type ScheduledJobConfig,
  type ScheduledJobArgs,
  Product,
}  from "@medusajs/medusa"
import Shopify from "shopify-api-node"
import ShopifyService from "../services/shopify"
import { EntityManager } from "typeorm"

import { transformShopifyProductToProductData } from "../utils"

export default async function handler({ container }: ScheduledJobArgs) {
  try {
    const manager: EntityManager = container.resolve("manager")
    const ProductRepository = manager.getRepository(Product)
    const productService = container.resolve<ProductService>("productService");

    const shopifyService: ShopifyService = container.resolve("shopifyService")
    const { products, status } = await shopifyService.getShopifyProducts();

    if (status === 200) {
      await Promise.all(
        products.map(async (shopifyProduct: Shopify.IProduct): Promise<Partial<Product>> => {
          if(shopifyProduct){
            const existingProduct = await ProductRepository.findOne({ where: { external_id: shopifyProduct.id.toString() } });

            if (!existingProduct) {
              const transformedProduct = await transformShopifyProductToProductData(shopifyProduct);
              try {
                // typeOrm mutation to feed data into database
                const newProduct = await productService.create(transformedProduct);

                if(newProduct){
                  return newProduct
                } else {
                  console.log(`********* Failed to save Order with ${shopifyProduct.id} **********`)
                }
              } catch (error) {
                console.log(error)
              }
            } else {
              console.log(`*************** Product with External ID ${shopifyProduct.id} already exist ***************`)
            }

            return existingProduct;
          }

          return null;
        })
      );
    }
  } catch (error) {
    console.log("<<<<<<<<<<<<<< Error in Product job >>>>>>>>>>>>")
    console.log(error)
  }
}

export const config: ScheduledJobConfig = {
  name: "sync-product-with-shopify-store",
  // schedule:  "*/1 * * * *",
  schedule: "0 * * * *",
  data: {},
}