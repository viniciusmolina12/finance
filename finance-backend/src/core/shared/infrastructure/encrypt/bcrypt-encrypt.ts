import { hash } from "bcryptjs";

import { Encrypt } from "#shared/domain/encrypt.js";

const PASSWORD_SALT_ROUNDS = 10;

export class BcryptEncrypt implements Encrypt {
  public async hash(value: string): Promise<string> {
    return hash(value, PASSWORD_SALT_ROUNDS);
  }
}
