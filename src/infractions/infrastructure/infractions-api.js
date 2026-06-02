import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const infractionsEndpointPath = import.meta.env.VITE_INFRACTIONS_ENDPOINT_PATH || "/infractions";

/**
 * Infrastructure gateway for Infractions bounded-context endpoints.
 * @class InfractionsApi
 * @extends BaseApi
 */
export class InfractionsApi extends BaseApi {
  #infractionsEndpoint;
  #ticketsEndpoint;

  constructor() {
    super();
    this.#infractionsEndpoint = new BaseEndpoint(this, infractionsEndpointPath);
    this.#ticketsEndpoint = new BaseEndpoint(this, "/tickets");
  }

  getAllInfractions() {
    return this.#infractionsEndpoint.getAll();
  }

  getInfractionById(id) {
    return this.#infractionsEndpoint.getById(id);
  }

  updateInfractionStatus(id, status) {
    return this.http.patch(`${this.#infractionsEndpoint.endpointPath}/${id}`, { status });
  }

  createTicket(ticket) {
    return this.#ticketsEndpoint.create(ticket);
  }
}