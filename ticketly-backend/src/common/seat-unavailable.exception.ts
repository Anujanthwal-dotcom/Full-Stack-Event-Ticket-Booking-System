export class SeatUnavailableException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeatUnavailableException';
  }
}
