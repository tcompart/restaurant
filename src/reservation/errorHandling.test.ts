import {BadRequest, ErrorHandling} from "./errorHandling";
import { Response } from 'express';
jest.mock('express');

let status = 200;
const DEFAULT_RESPONSE = {};
let sendResponse = DEFAULT_RESPONSE;
const mockedResponse = {
  status: (number) => {
    status = number;
  },
  send: (body?: any) => {
    sendResponse = body;
  }
} as Response;

describe('errorHandling', () => {

  afterEach(() => {
    status = 200;
    sendResponse = DEFAULT_RESPONSE;
  });

  test('can be created with a BadRequest', () => {
    const error = new ErrorHandling(mockedResponse);
    error.onRejected(new BadRequest("I am a failure", "Test"));
    expect(status).toBe(400);
    expect(sendResponse).toBe("Bad request.");
  });

  test('can be created with a general error', () => {
    const error = new ErrorHandling(mockedResponse);
    error.onRejected(new Error("I am a general failure"));
    expect(status).toBe(500);
    expect(sendResponse).toBe(DEFAULT_RESPONSE);
  });
});