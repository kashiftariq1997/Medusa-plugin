import {
  type ProductService,
  type ScheduledJobConfig,
  type ScheduledJobArgs,
  Product,
}  from "@medusajs/medusa"
import ShopifyService from "../services/shopify"
import { EntityManager } from "typeorm"

import {
  mapAddress, mapCustomer, mapDiscounts, mapFulfillmentStatus, mapLineItems,
  mapOrderStatus, mapPaymentStatus, transformShopifyOrderToOrderData, transformShopifyProductToProductData
} from "../utils"
import { ShopifyProduct } from "../types"

export default async function handler({
  container,
  data,
  pluginOptions,
}: ScheduledJobArgs) {
  try {
    const manager: EntityManager = container.resolve("manager")
    const ProductRepository = manager.getRepository(Product)
    const productService = container.resolve<ProductService>("productService");

    const shopifyService: ShopifyService = container.resolve("shopifyService")
    const { products, status } = await shopifyService.getShopifyProducts();
    console.log(status, "Products ", products.length )
    if (status === 200) {
      await Promise.all(
        products.map(async (shopifyProduct: ShopifyProduct): Promise<Partial<Product>> => {
          if(shopifyProduct){
            const existingOrder = await ProductRepository.findOne({ where: { external_id: shopifyProduct.id.toString() } });

            if (!existingOrder) {
              const transformedProduct = await transformShopifyProductToProductData(shopifyProduct, manager);
              console.log("---------------------------------")
              console.log(transformedProduct)
              console.log("---------------------------------")
              try {
                console.log(`<<<<<<<<< Creating product ${shopifyProduct.title}  >>>>>>>>>>`)
                // typeOrm mutation to feed data into database
                const newProduct = await productService.create(transformedProduct);
                console.log("XXXXXXXXXXX", newProduct)
                if(newProduct){
                  console.log(`<<<<<<<<< Product ${shopifyProduct.title} created  >>>>>>>>>>`)
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

            return existingOrder;
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
  schedule:  "*/1 * * * *",
  data: {},
}