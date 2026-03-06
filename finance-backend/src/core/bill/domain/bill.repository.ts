import { Bill } from "#bill/domain/bill.aggregate.js";

export interface IBillRepository {
  create(bill: Bill): Promise<void>;
}
