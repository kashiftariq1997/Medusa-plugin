import { 
  ProductService as MedusaProductService, Product,
} from "@medusajs/medusa";
import ShopifyService from "./shopify";

class ProductService extends MedusaProductService {
  private shopifyService: ShopifyService;

  constructor(container: any) {
    super(container);
    this.shopifyService = new ShopifyService(container);
  }

  async delete(id: string): Promise<void> {
    const product = await this.retrieve(id);

    if (product) {
      await this.shopifyService.deleteProduct(product.external_id);
      await super.delete(id);
    }
  }
}

export default ProductService;
