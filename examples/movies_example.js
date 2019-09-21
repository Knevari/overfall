const Overfall = require('../src');

const fakeDatabase = {
  movies: [
    {
      id: 1,
      name: "Lord of The Rings"
    }
  ],
  update(key, values) {
    this[key].push(...values);
  }
}

const overfall = new Overfall({ movies: [] });
// overfall.state.movies.syncWith(fakeDatabase.movies);

overfall.persistState();

overfall.on("update_movies").do(({ movies }) => {
  fakeDatabase.update("movies", movies);
}).when("movies");

overfall.changeState(previous => ({
  movies: [...previous.movies, { id: 2, name: "Harry Potter" }]
}));

overfall.events.update_movies.delete();

// Possible future APIs
// - overfall.loadFromStorage()      M
// - overfall.loadStateFrom(obj)     X
// - overfall.state[prop].syncWith() O

// It could return only the data that was added to state.
