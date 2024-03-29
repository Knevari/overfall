const Overfall = require('../src');

it('should be able to update state', function() {
  const overfall = new Overfall();

  overfall.changeState({ foo: "bar" });
  overfall.changeState({ bar: "zaz" });

  expect(overfall.state.foo).toBe('bar');
});

it('should be able to create events', function() {
  const overfall = new Overfall();

  overfall.on("event_one").do(() => {
    console.log("First event published");
  })

  overfall.on("event_two").do(() => {
    console.log("Second event published");
  })

  overfall.on("event_three").do(() => {
    console.log("Third event published");
  })

  expect(overfall.events).toMatchSnapshot();
});

it('should remove the event dependency if the dependant ' +
   'piece of state is removed', function() {
  const overfall = new Overfall({ books: [], movies: [] });

  overfall.on("event").do(() => {}).when("books", "movies");
  overfall.changeState(previous => ({ movies: [] }));

  expect(overfall.events.event.dependencies).toContain("movies");
});

it('should execute the event functions correctly if' +
   'some dependency is removed', function() {
  const overfall = new Overfall({ books: [], movies: [] });

  let executedFirst = false;
  let executedSecond = false;

  overfall
    .on("event_one")
    .do(() => (executedFirst = true))
    .when("books", "movies");
  overfall.changeState(previous => ({ movies: [] }));

  overfall
    .on("event_two")
    .do(() => (executedSecond = true))
    .when("movies");
  overfall.changeState({ movies: ["Lord of The Rings"] });

  expect(executedFirst).toBe(true);
  expect(executedSecond).toBe(true);
});

it('should delete the event', function() {
  const overfall = new Overfall();

  overfall.on("event_one").do(() => {});
  overfall.on("event_two").do(() => {});

  overfall.events.event_one.delete();

  expect(overfall.events).toMatchSnapshot();
});

it('should call the event functions when the state changes', function() {
  const overfall = new Overfall({ movies: [] });

  let executedFunction = false;

  overfall
    .on("event_one")
    .do(() => (executedFunction = true))
    .when("movies");

  overfall.changeState({ movies: ["Lord of The Rings"] });

  expect(executedFunction).toBe(true);
})
