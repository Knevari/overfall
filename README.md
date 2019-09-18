# Overfall

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

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
import Overfall from "overfall";
```
The way overfall works is by storing every piece of data you want to interact with inside a state, and attaching events to be called when the data changes.

###### Example
```
const manager = new Overfall({ movies: [] });

manager.changeState({ movies: ["Alien Covenant"] });
console.log(manager.state); // { movies: ["Alien Covenant"] }
```
Besides working with simple state management, you can also attach events to the library to be called when some data from the state changes, the way you do that, is by calling the "on" method passing the event name as argument, you only need the event name to call the events manually if you need to, but, the event is gonna be triggered every time that a data you specified changes, the "do" method must be called after you specify the event name to tell the library what it must do when that certain event is published, and finally the "when" method, that is gonna responsible for saying when that event is gonna be triggered automatically.
```
manager.on("update_movies").do((params) => {
  const { movies } = params;
  console.log("Calling update_movies Event");
  console.log("New Movies -> ", movies);
}).when("movies")

manager.changeState({ movies: ["Lord of The Rings"] });

// Calling update_movies Event
// New Movies -> ["Lord of The Rings"]

// You can also pass a function as parameter to changeState.
manager.changeState(previouState => ({
    movies: [...previouState.movies, "Alien Covenant"]
}));

// Calling update_movies Event
// New Movies -> ["Lord of The Rings", "Alien Covenant"]
```
It is also possible to save a current state to return to it later using the "save" and "restore" functions, pretty straightforward, it can be useful if you want to reset the state, or maybe act as rollback in some cases.

##### Obs: The API is not complete yet, and it's probably going to occur changes, if you want to help, feel free to modify the code and request a pull request, If you could help me find any bugs I would appreciate so much :smiley:.
