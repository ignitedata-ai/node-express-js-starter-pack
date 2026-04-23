export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract delete(id: string): Promise<T>;
  abstract count(): Promise<number>;
}
