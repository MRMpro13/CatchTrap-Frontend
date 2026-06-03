import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const ticketsEndpointPath = import.meta.env.VITE_CITIZENS_ENDPOINT_PATH || "/tickets";

export class CitizenPortalApi extends BaseApi {
  #ticketsEndpoint;

  constructor() {
    super();
    this.#ticketsEndpoint = new BaseEndpoint(this, ticketsEndpointPath);
  }

  searchTicketsByPlate(plate) {
    return this.http.get(this.#ticketsEndpoint.endpointPath, { params: { plate } });
  }

  getTicketById(id) {
    return this.#ticketsEndpoint.getById(id);
  }

  payTicket(id, data) {
    return this.http.patch(`${this.#ticketsEndpoint.endpointPath}/${id}`, data);
  }
}