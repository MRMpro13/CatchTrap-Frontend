/**
 * Ticket entity within the Citizen bounded context.
 * @class Ticket
 */
export class Ticket {
  constructor({ id = null, infractionId = null, plate = '', amount = 0, status = 'UNPAID', issuedAt = null }) {
    this.id = id;
    this.infractionId = infractionId;
    this.plate = plate;
    this.amount = amount;
    this.status = status;
    this.issuedAt = issuedAt;
  }
}