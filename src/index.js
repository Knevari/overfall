/**
 * @license
 * Copyright (c) 2019 Knevari
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const deepCopy = require("./helpers/deepCopy");

class Overfall {
  constructor(initialState = {}) {
    this._internalState = initialState;
    this._refferedState = null;
    this._indexes = [];
    this._persistData = false;
    this._eventBus = { events: {} };
    this.configureIndexes();
  }

  get state() {
    return this._internalState;
  }

  set state(newState) {
    console.warn("You shouldn't be mutating the state!");
    this._internalState = deepCopy(newState);
  }

  get events() {
    return this._eventBus.events;
  }

  set events(newEvents) {
    this._eventBus.events = newEvents;
  }

  publish(eventName, ...args) {
    if (!this.hasEvent(eventName)) throw new Error("That event doesn't exist.");

    const event = this._eventBus.events[eventName];

    Object.getOwnPropertySymbols(event.subscribers).forEach(key => {
      event.subscribers[key].apply(null, [args]);
    });
  }

  save() {
    this._refferedState = deepCopy(this._internalState);
  }

  restore() {
    if (!this._refferedState) return;
    this._internalState = deepCopy(this._refferedState);
    this._refferedState = null;
  }

  configureIndexes() {
    const keys = Object.keys(this._internalState);
    this._indexes = [...keys];
  }

  changeState(updater) {
    if (typeof updater !== "object" && typeof updater !== "function")
      throw new Error("You must pass an object or function as param.");

    let newState, newStateKeys;
    const currState = deepCopy(this._internalState);
    const currStateKeys = Object.keys(this._internalState);

    if (typeof updater === "function") {
      newState = updater(currState);
      newStateKeys = Object.keys(newState);
    } else {
      newState = Object.assign(currState, updater);
      newStateKeys = Object.keys(updater);
    }

    this._internalState = deepCopy(newState);

    const deletedProperties = this._indexes.filter(
      key => newStateKeys.indexOf(key) === -1
    );

    if (deletedProperties.length > 0) {
      this.clearDataEvents(deletedProperties);
    }

    this.configureIndexes();

    if (newStateKeys.length > 0) {
      const events = this.getDataEvents(newStateKeys);

      events.forEach(evt => {
        const params = {};

        evt.dependencies.forEach(dep => {
          params[dep] = newState[dep];
        });

        Object.getOwnPropertySymbols(evt.subscribers).forEach(subKey =>
          evt.subscribers[subKey].apply(null, [params])
        );
      });
    }

    if (this._persistData) this.persistState();
  }

  persistState() {
  }

  clearDataEvents(stateKeys) {
    Object.keys(this._eventBus.events).forEach(evt => {
      const event = this._eventBus.events[evt];

      for (const key of stateKeys) {
        const idx = event.dependencies.indexOf(key);

        if (idx >= 0) {
          if (event.dependencies.length === 1) {
            delete this._eventBus.events[evt];
          } else {
            event.dependencies.splice(idx, 1);
          }
        }
      }
    });
  }

  getDataEvents(stateKeys) {
    const evts = [];
    Object.keys(this._eventBus.events).forEach(evt => {
      const event = this._eventBus.events[evt];

      for (const key of stateKeys) {
        if (event.dependencies.indexOf(key) >= 0) {
          if (evts.indexOf(event) === -1) {
            evts.push(event);
          }
        }
      }
    });
    return evts;
  }

  hasEvent(eventName) {
    return this._eventBus.events.hasOwnProperty(eventName);
  }

  eventHasDependency(eventName, dependency) {
    return this._eventBus.events[eventName].dependencies.indexOf(dependency) >= 0
  }

  createEvent(eventName) {
    this._eventBus.events[eventName] = {
      subscribers: {},
      dependencies: [],
      delete: () => {
        delete this._eventBus.events[eventName];
      }
    };
  }

  subscribeToEvent(eventName, callback) {
    const id = Symbol("id");
    this._eventBus.events[eventName].subscribers[id] = callback;
    return id;
  }

  unsubscribeFromEvent(eventName, eventId) {
    delete this._eventBus.events[eventName].subscribers[eventId];
  }

  addEventDependencies(eventName, piecesOfState) {
    piecesOfState = piecesOfState.filter(
      p => Object.keys(this._internalState).indexOf(p) >= 0
    );

    piecesOfState.forEach(p => {
      if (!this.eventHasDependency(eventName, p)) {
        this._eventBus.events[eventName].dependencies.push(p);
      }
    });
  }

  on(eventName) {
    if (!this.hasEvent(eventName)) {
      this.createEvent(eventName);
    }

    return {
      do: event => {
        const id = this.subscribeToEvent(eventName, event);

        const unsubscribe = () => {
          this.unsubscribeFromEvent(eventName, id);
        };

        return {
          when: (...dependencies) => {
            this.addEventDependencies(eventName, dependencies);
            return { unsubscribe };
          },
          unsubscribe
        };
      }
    };
  }
}

module.exports = Overfall;
