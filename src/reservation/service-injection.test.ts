import {getReservationRepository} from "./service-injection";
import {ReservationImpl} from "./reservation.impl";
import {Reservation} from "./reservation";
import {FakeDatabase} from "./fake-database";
import {DatabaseReservationRepository} from "./databaseReservationRepository";

describe('service-injection', () => {

  const today = new Date();

  const reservation = {
    at: today,
    email: 'my@mail.com'
  } as Reservation;

  test('creates by default FakeDatabase', () => {
    const database = getReservationRepository();
    expect(database).toBeInstanceOf(FakeDatabase);
  });

  test('reuses the fake database between requests outside PROD', () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      expect(getReservationRepository()).toBeInstanceOf(FakeDatabase);
    } finally {
      if (previousEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnv;
    }
  });

  test('uses the database repository in PROD', () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'PROD';
    try {
      expect(getReservationRepository()).toBeInstanceOf(DatabaseReservationRepository);
    } finally {
      if (previousEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnv;
    }
  });

  test('can create and store reservations', () => {
    const database = new FakeDatabase();
    database.create(reservation);
    expect(database[0]).toBeInstanceOf(ReservationImpl);
    expect(database[0].email).toBe('my@mail.com');
    expect(database[0].id).toBeDefined();
  })

  test('can find created reservations', async () => {
    const database = new FakeDatabase();
    await database.create(reservation);
    const reservations =  database.read(today);
    await expect(reservations).resolves.toHaveLength(1);
    const stored = database.pop();
    expect(stored?.email).toBe('my@mail.com');
  });

  test('can delete created reservations', async () => {
    const database = new FakeDatabase();
    await database.create(reservation);
    const id = database[0].id;
    if (id == null) throw new Error('Expected reservation to have an id');
    const foundReservation = await database.delete(id);
    expect(foundReservation?.id).toBe(id);
    expect(database).toHaveLength(0);
  });
});