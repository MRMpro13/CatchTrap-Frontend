/**
 * Sensor entity within the Monitoring bounded context.
 * @class Sensor
 */
export class Sensor {
  constructor({ id = null, location = '', status = 'INACTIVE', lastPing = null, battery = 100, firmware = '1.0.0', latitude = null, longitude = null }) {
    this.id = id;
    this.location = location;
    this.status = status;
    this.lastPing = lastPing;
    this.battery = battery;
    this.firmware = firmware;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}