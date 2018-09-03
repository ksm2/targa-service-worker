import { expect } from 'chai'
import 'mocha'
import { AsyncArrayIterator } from './AsyncArrayIterator'

describe('AsyncArrayIterator', () => {

  it('is returning valid done or flushed states', async () => {
    const it = new AsyncArrayIterator<number>()
    expect(it.flushed).to.be.false
    expect(it.done).to.be.false

    it.flush()
    expect(it.flushed).to.be.true
    expect(it.done).to.be.false

    await it.next()
    expect(it.flushed).to.be.true
    expect(it.done).to.be.true
  })

  it('returns values which are enqueued', async () => {
    const it = new AsyncArrayIterator<number>()
    it.enqueue(1)
    it.enqueue(2)
    it.enqueue(3)
    it.flush()

    expect(await it.next()).to.eql({ done: false, value: 1 })
    expect(await it.next()).to.eql({ done: false, value: 2 })
    expect(await it.next()).to.eql({ done: false, value: 3 })
    expect(await it.next()).to.eql({ done: true, value: undefined })
    expect(await it.next()).to.eql({ done: true, value: undefined })
    expect(await it.next()).to.eql({ done: true, value: undefined })
  })

  it('cannot enqueue after flush', async () => {
    const it = new AsyncArrayIterator<number>()
    it.enqueue(1)
    it.enqueue(2)
    it.flush()

    expect(() => it.enqueue(3)).to.throw('Cannot enqueue value as iterator has already been flushed.')
  })

  it('returns specific values', async () => {
    const it = new AsyncArrayIterator<number>()
    expect(it.flushed).to.be.false
    expect(it.done).to.be.false

    const result = await it.return(42)
    expect(result).to.eql({ done: true, value: 42 })
    expect(it.flushed).to.be.true
    expect(it.done).to.be.true

    expect(await it.next()).to.eql({ done: true, value: undefined })
    expect(await it.next()).to.eql({ done: true, value: undefined })
    expect(await it.next()).to.eql({ done: true, value: undefined })
  })
})
