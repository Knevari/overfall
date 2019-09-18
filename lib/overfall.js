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

const deepCopy = require("../helpers/deepCopy");

class Overfall {
  constructor(initialState = {}) {
    this.internalState = initialState;
    this.refferedState = null;
    this.indexes = [];
    this.eventBus = { subscribers: {} };
    this.configureIndexes();
  }

  get state() {
    return deepCopy(this.internalState);
  }

  set state(newState) {
    this.internalState = deepCopy(newState);
  }

  publish(eventName, ...args) {
    if (!this.hasEvent(eventName)) {
      this.eventBus.subscribers[eventName].forEach(fn => {
        fn.apply(null, [args]);
      });
    }
    throw new Error("That event doesn't exist.");
  }

  save() {
    this.refferedState = deepCopy(this.internalState);
  }

  restore() {
    this.internalState = deepCopy(this.refferedState);
    this.refferedState = null;
  }

  configureIndexes() {
    const keys = Object.keys(this.internalState);
    this.indexes = [...keys];
  }

  changeState(updater) {
    if (typeof updater !== "object" && typeof updater !== "function")
      throw new Error("You must pass an object or function as param.");

    let newState;

    if (typeof updater === "function") {
      newState = updater(deepCopy(this.internalState));
    } else {
      const currState = deepCopy(this.internalState);
      newState = Object.assign(currState, updater);
    }

    const currStateKeys = Object.keys(this.internalState);
    const newStateKeys = Object.keys(updater);

    this.internalState = deepCopy(newState);

    const deletedProperties = this.indexes.filter(
      key => newStateKeys.indexOf(key) === -1
    );

    if (deletedProperties.length > 0) {
      this.clearDataSubscribers(deletedProperties);
    }

    this.configureIndexes();

    if (newStateKeys.length > 0) {
      const stateCopy = deepCopy(newState);
      const subscribers = this.getDataSubscribers(stateCopy);

      subscribers.forEach(sub => {
        const params = {};
        sub.dependencies.forEach(dep => {
          params[dep] = stateCopy[dep];
        });
        sub.functions.forEach(fn => fn.apply(null, [params]));
      });
    }
  }

  clearDataSubscribers(stateKeys) {
    Object.keys(this.eventBus.subscribers).forEach(sub => {
      const subscriber = this.eventBus.subscribers[sub];

      for (const key of stateKeys) {
        const idx = subscriber.dependencies.indexOf(key);

        if (idx >= 0) {
          if (subscriber.dependencies.length === 1) {
            delete this.eventBus.subscribers[sub];
          } else {
            subscriber.dependencies.splice(idx, 1);
          }
        }
      }
    });
  }

  getDataSubscribers(stateKeys) {
    const subs = [];
    const keys = Object.keys(stateKeys);
    Object.keys(this.eventBus.subscribers).forEach(sub => {
      const subscriber = this.eventBus.subscribers[sub];
      // subscribers.functions
      // subscribers.dependencies
      for (const key of keys) {
        if (subscriber.dependencies.indexOf(key) >= 0) {
          if (subs.indexOf(subscriber) === -1) {
            subs.push(subscriber);
          }
        }
      }
    });
    return subs;
  }

  hasEvent(eventName) {
    return this.eventBus.subscribers.hasOwnProperty(eventName);
  }

  eventHasDependency(eventName, dependency) {
    return (
      this.eventBus.subscribers[eventName].dependencies.indexOf(dependency) >= 0
    );
  }

  createEvent(eventName) {
    this.eventBus.subscribers[eventName] = {
      functions: [],
      dependencies: []
    };
  }

  subscribeToEvent(eventName, callback) {
    this.eventBus.subscribers[eventName].functions.push(callback);
  }

  unsubscribeFromEvent(eventName, eventIndex) {
    this.eventBus.subscribers[eventName].functions.splice(eventIndex, 1);
  }

  addEventDependencies(eventName, piecesOfState) {
    piecesOfState = piecesOfState.filter(
      p => Object.keys(this.internalState).indexOf(p) >= 0
    );

    piecesOfState.forEach(p => {
      if (!this.eventHasDependency(eventName, p)) {
        this.eventBus.subscribers[eventName].dependencies.push(p);
      }
    });
  }

  on(eventName) {
    if (!this.hasEvent(eventName)) {
      this.createEvent(eventName);
    }

    return {
      do: event => {
        const eventIndex = this.subscribeToEvent(eventName, event);

        // Still working.
        const unsubscribe = () => {
          this.unsubscribeFromEvent(eventName, eventIndex);
        };

        return {
          when: (...dependencies) => {
            this.addEventDependencies(eventName, dependencies);
            // return { unsubscribe };
          }
          // unsubscribe
        };
      }
    };
  }
}

module.exports = Overfall;
