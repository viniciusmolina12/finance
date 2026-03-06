export abstract class ValueObject {
  public abstract readonly value: unknown;

  public equals(other: ValueObject): boolean {
    return this.value === other.value;
  }
}
