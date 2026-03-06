export interface UnitOfWork {
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
