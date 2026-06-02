import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

/**
 * Infrastructure gateway for Monitoring bounded-context endpoints.
 * @class SensorMonitoringApi
 * @extends BaseApi
 */
export class SensorMonitoringApi extends BaseApi {
  #sensorsEndpoint;
  #firmwareEndpoint;

  constructor() {
    super();
    this.#sensorsEndpoint = new BaseEndpoint(this, "/sensors");
    this.#firmwareEndpoint = new BaseEndpoint(this, "/firmware");
  }

  getAllSensors() {
    return this.#sensorsEndpoint.getAll();
  }

  getLatestFirmwareVersion() {
    return this.#firmwareEndpoint.getAll();
  }

  patchSensor(id, data) {
    return this.#sensorsEndpoint.patch(id, data);
  }
}