import { OrderService as MedusaOrderService, } from "@medusajs/medusa";
import ShopifyService from "./shopify";

class OrderService extends MedusaOrderService {
  private shopifyService: ShopifyService;

  constructor(container: any) {
    super(container);
    this.shopifyService = new ShopifyService(container);
  }

  async delete(id: string): Promise<void> {
    const order = await this.retrieve(id);

    if (order) {
      await this.shopifyService.deleteOrder(order.external_id as unknown as number);
      await super.archive(id);
    }
  }
}

export default OrderService;
