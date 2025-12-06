
export class Bus {
    data = {}
    aliveCache = []
    _events = {}
    $on (eventName, handle) {
      this._events[eventName] = this._events[eventName] || []
      this._events[eventName].push(handle)
    }
    $off (eventName, handle) {
      if (!this._events[eventName]) return
      this._events[eventName] = this._events[eventName].filter((el) => el !== handle)
    }
    $emit (eventName, ...arg) {
      if (!this._events[eventName]) return
      const event = this._events[eventName]
      if (!Array.isArray(event)) {
        if (typeof event !== 'function') return
        return event(...arg)
      }
      event.forEach((handle) => {
        if (typeof handle === 'function') handle(...arg)
      })
    }
    $destroy () {
      this._events = {}
    }
    $onOnce (eventName, handle) {
      if (this._events[eventName]) return
      this._events[eventName] = handle
    }
    $offOnce (eventName, _handle) {
      delete this._events[eventName]
    }
}

const VBus = new Bus()
export default VBus