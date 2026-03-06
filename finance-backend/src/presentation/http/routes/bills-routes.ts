import { Router } from "express";

import { CreateBillController } from "#presentation/http/controllers/bills/create-bill-controller.js";

export function createBillsRoutes(
  create_bill_controller: CreateBillController,
): Router {
  const bills_router = Router();

  bills_router.post("/", create_bill_controller.handle);

  return bills_router;
}
