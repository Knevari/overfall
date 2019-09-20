# Overfall

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm Status](https://img.shields.io/badge/node-package-manager)](https://www.npmjs.com/package/overfall)

A simple and lightweight state management library for JS

## Overview

This is a simple Javascript tool that allows you to listen and emit events when certain data changes in your state. allowing for reactive and structured state management.

## Install
Simply install it by using `npm install overfall`

And then, you must import the library into your code using:
```javascript
const Overfall = require("overfall");
// or if you're using ES6
import Overfall from "overfall";
```

## API

### `changeState`
The changeState method must be called when you need to update state, its API receives an object describing what should change in your state, or a function that receives the previous state as parameter and should return an object.
```javascript
const overfall = new Overfall();

overfall.changeState({  movies: [] });

overfall.changeState(previous => ({
	movies: [...previous.movies, "Lord of The Rings"]
}));

overfall.changeState({ books: [] });

console.log(overfall.state);
// { movies: ["Lord of The Rings"], books: [] }
```

### `on`
The "on" API is pretty straightforward, we need to pass the event name as parameter to it, so we can use it to access the event later on,
its return value is an object containing the "do" method that receives a function as parameter, this function shall describe what should happen after that event is triggered. We can add more than just one function to the same event. The "do" method returns a new object containing two helper functions called "when" and "unsubscribe", the "unsubscribe" completely removes the event from overfall, and the "when" method should be called when you want to define when the event should execute, in our example, that function is only going to be executed if the "movies" property in our state changes.
```javascript
overfall.on("update_movies").do((params) => {
  const { movies } = params;
  console.log("Calling update_movies Event");
  console.log("New Movies -> ", movies);
}).when("movies")
```

### `save`
```javascript
overfall.save()
```
You can save the current state if you wish to comeback to it later, or save it as a restore point if something goes wrong.
### `restore`
```javascript
overfall.save()
```
You must call restore if you want to retrieve the state that you previously saved in your code.


##### Obs: The API is not complete yet, and it's probably going to occur changes, if you want to help, feel free to modify the code and make a pull request, I would appreciate so much if you could help me find any bugs :smiley:
