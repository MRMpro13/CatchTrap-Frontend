import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

/**
 * Infrastructure gateway for Monitoring bounded-context endpoints.
 * @class SensorMonitoringApi
 * @extends BaseApi
 */
export class SensorMonitoringApi extends BaseApi {
  #sensorsEndpoint;

  constructor() {
    super();
    this.#sensorsEndpoint = new BaseEndpoint(this, "/sensors");
  }

  getAllSensors() {
    return this.#sensorsEndpoint.getAll();
  }
}