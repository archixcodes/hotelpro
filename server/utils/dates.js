import { HttpError } from './httpError.js';

// Date-only input is anchored at UTC midnight, so timezone changes cannot shift a stay.
export function parseDateOnly(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, fieldName + ' must use YYYY-MM-DD format.', 'INVALID_DATE');
  }
  const date = new Date(value + 'T00:00:00.000Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, fieldName + ' is not a valid calendar date.', 'INVALID_DATE');
  }
  return date;
}
export function nightsBetween(checkIn, checkOut) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
}
export function occupiedNights(checkIn, checkOut) {
  const nights = [];
  for (let time = checkIn.getTime(); time < checkOut.getTime(); time += 86400000) nights.push(new Date(time));
  return nights;
}
