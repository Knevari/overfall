# Overfall

A simple and lightweight state management library for JS

## Overview

This is a simple Javascript tool that allows you to listen and emit events when certain data changes in your state. allowing for reactive and structured state management.

## Install
Simply install it by using `npm install overfall`

## API

At first, you must import the library into your code using:
```
const Overfall = require("overfall");
// or if you're using ES6
import overfall from "overfall";
```
The way overfall works is by storing every piece of data you want to interact with inside a state, and attaching events to be called when the data changes.

###### Example
```
const manager = new Overfall({
	movies: []
});

manager.changeState({ movies: ["Alien Covenant"] });
console.log(manager.state); // { movies: ["Alien Covenant"] }
```
Besides working with simple state management, you can also attach events to the library to be called when some data from the state changes, if you specify when the event must be called then the "do" method parameter is going to be an object containing all the data from state that you specified. If you don't specify any data from state, then the only way to call the event is by publishing it manually using the "publish" method.
```
manager.on("update_movies").do((params) => {
	const { movies } = params;
  console.log("Calling update_movies Event");
  console.log("New Movies -> ", movies); // [...]
}).when("movies")

manager.changeState({ movies: ["Lord of The Rings"] });

// Calling update_movies Event
// New Movies -> ["Lord of The Rings"]
```
It is also possible to save a current state to return to it later using the "save" and "restore" functions, pretty straightforward, it can be useful if you want to reset the state, or maybe act as rollback in some cases.

##### Obs: The API is not complete yet, and it's probably going to occur changes, if you want to help, feel free to modify the code and request a pull request, I would be happy to see that.
