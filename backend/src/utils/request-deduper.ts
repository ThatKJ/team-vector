export class RequestDeduper {
  private activePromises = new Map<string, Promise<any>>();

  public async dedupe<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.activePromises.has(key)) {
      return this.activePromises.get(key) as Promise<T>;
    }

    const promise = operation().finally(() => {
      this.activePromises.delete(key);
    });

    this.activePromises.set(key, promise);
    return promise;
  }
}

// Export a global singleton instance
export const requestDeduper = new RequestDeduper();
