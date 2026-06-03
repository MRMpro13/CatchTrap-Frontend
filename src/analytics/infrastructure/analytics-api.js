import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

/**
 * Infrastructure gateway for Analytics bounded-context endpoints.
 * @class AnalyticsApi
 * @extends BaseApi
 */
export class AnalyticsApi extends BaseApi {
  #reportsEndpoint;
  #infractionsEndpoint;

  constructor() {
    super();
    this.#reportsEndpoint = new BaseEndpoint(this, "/reports");
    this.#infractionsEndpoint = new BaseEndpoint(this, "/infractions");
  }

  getReports() {
    return this.#reportsEndpoint.getAll();
  }

  getInfractions() {
    return this.#infractionsEndpoint.getAll();
  }
}