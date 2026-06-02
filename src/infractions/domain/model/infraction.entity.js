/**
 * Infraction entity within the Infractions bounded context.
 * @class Infraction
 */
export class Infraction {
  constructor({ id = null, sensorId = null, plate = '', speed = 0, limit = 0, timestamp = null, status = 'PENDING_VALIDATION' }) {
    this.id = id;
    this.sensorId = sensorId;
    this.plate = plate;
    this.speed = speed;
    this.limit = limit;
    this.timestamp = timestamp;
    this.status = status;
  }
}