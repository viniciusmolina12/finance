export interface Encrypt {
  hash(value: string): Promise<string>;
}
