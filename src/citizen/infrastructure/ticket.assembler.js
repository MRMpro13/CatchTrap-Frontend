import {Ticket} from "../domain/model/ticket.entity.js";

export class TicketAssembler {
  static toEntityFromResource(resource) {
    return new Ticket({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (!response.data) return [];
    const resources = Array.isArray(response.data) ? response.data : response.data['tickets'] || [];
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}