import {Link, ResponseBody} from "./responsebody";

describe('response body', () => {
    test('creates a response body', () => {
        const givenLinks = [new Link("urn:addReservation", new URL("http://localhost:3000/reservation"))];
        const responseBody = new ResponseBody(givenLinks);
        expect(responseBody.get().links).toBe(givenLinks);
        expect(givenLinks[0].get().rel).toBe("urn:addReservation");
        expect(givenLinks[0].get().href.href).toBe("http://localhost:3000/reservation");
    });
});