import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

/**
 * Infrastructure gateway for Citizen bounded-context endpoints.
 * @class CitizenPortalApi
 * @extends BaseApi
 */
export class CitizenPortalApi extends BaseApi {
  #ticketsEndpoint;

  constructor() {
    super();
    this.#ticketsEndpoint = new BaseEndpoint(this, "/tickets");
  }

  searchTicketsByPlate(plate) {
    return this.http.get(`${this.#ticketsEndpoint.endpointPath}?plate=${plate}`);
  }

  getTicketById(id) {
    return this.#ticketsEndpoint.getById(id);
  }

  payTicket(id) {
    return this.http.patch(`${this.#ticketsEndpoint.endpointPath}/${id}`, { status: 'PAID', paidAt: new Date().toISOString() });
  }
}