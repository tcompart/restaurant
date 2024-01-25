import {FakeDatabase, getReservationRepository} from "./service-injection";
import {ReservationImpl} from "./reservation.impl";
import {Reservation} from "./reservation";

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

  test('can create and store reservations', () => {
    const database = new FakeDatabase();
    database.create(reservation);
    expect(database[0]).toBeInstanceOf(ReservationImpl);
    expect(database[0].email).toBe('my@mail.com');
    expect(database[0].id).toBeDefined();
  })

  test('can find created reservations', () => {
    const database = new FakeDatabase();
    database.create(reservation);
    const reservations =  database.findReservationsOnDate(today);
    expect(reservations).resolves.toHaveLength(1);
    expect(reservations).resolves.toBeDefined();
    const stored = database.pop();
    expect(stored?.email).toBe('my@mail.com');
  });

  test('can delete created reservations', async () => {
    const database = new FakeDatabase();
    await database.create(reservation);
    const id = database[0].id;
    // @ts-ignore
    const foundReservation = await database.delete(id);
    expect(foundReservation?.id).toBe(id);
    expect(database).toHaveLength(0);
  });
});