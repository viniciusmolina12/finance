export class DomainError extends Error {
  public readonly code: string;

  public constructor(message: string, code: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
