type Flushable<T> = T | typeof FLUSH_MARK

// Symbols to use
const FLUSH_MARK = Symbol('FlushMark')
const IS_FLUSHED = Symbol('IsFlushed')
const IS_DONE = Symbol('IsDone')

export class AsyncArrayIterator<T> implements AsyncIterator<T | undefined> {
  private [IS_FLUSHED]: boolean = false
  private [IS_DONE]: boolean = false
  private readonly items: Flushable<T>[] = []
  private readonly resolvers: Resolver<IteratorResult<T | undefined>>[] = []

  get flushed(): boolean {
    return this[IS_FLUSHED]
  }

  get done(): boolean {
    return this[IS_DONE]
  }

  /**
   * Enqueue a new item to the iterator.
   */
  enqueue(item: T): void {
    // You cannot enqueue another value after flushing
    if (this.flushed) {
      throw new TypeError('Cannot enqueue value as iterator has already been flushed.')
    }

    this.enqueueItem(item)
  }

  /**
   * Flush the iterator.
   */
  flush(): void {
    this[IS_FLUSHED] = true
    this.enqueueItem(FLUSH_MARK)
  }

  /**
   * Get the next value asynchronously from the iterator.
   */
  next(value?: any): Promise<IteratorResult<T | undefined>> {
    return new Promise<IteratorResult<T | undefined>>((resolver) => {
      this.resolvers.push(resolver)
      this.processIterator()
    })
  }

  /**
   * Returns the iterator with the given value.
   */
  return(value?: any): Promise<IteratorResult<T | undefined>> {
    this[IS_DONE] = true
    this[IS_FLUSHED] = true

    return Promise.resolve({ done: true, value })
  }

  /**
   * Lets the iterator throw the given value.
   */
  throw(e?: any): Promise<IteratorResult<T | undefined>> {
    return Promise.reject(e)
  }

  /**
   * Enqueues another flushable item to the queue.
   */
  private enqueueItem(item: Flushable<T>) {
    this.items.push(item)
    this.processIterator()
  }

  /**
   * Dequeues the next flushable item.
   */
  private dequeueItem(): IteratorResult<T | undefined> {
    const item = this.items.shift()
    if (item === FLUSH_MARK) {
      this[IS_DONE] = true
      return { done: true, value: undefined }
    }

    return { done: false, value: item }
  }

  /**
   * Processes all resolvers and items.
   */
  private processIterator(): void {
    if (this.resolvers.length) {
      // Is the iterator already done?
      if (this.done) {
        const resolver = this.resolvers.shift()!
        resolver({ done: true, value: undefined })
        return this.processIterator()
      }

      // Is there another item?
      if (this.items.length) {
        const resolver = this.resolvers.shift()!
        resolver(this.dequeueItem())
        return this.processIterator()
      }
    }
  }
}
