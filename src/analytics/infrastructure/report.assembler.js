import {Report} from "../domain/model/report.entity.js";

/**
 * Maps reports resources into domain entities.
 * @class ReportAssembler
 */
export class ReportAssembler {
  static toEntityFromResource(resource) {
    return new Report({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array ? response.data : response.data['reports'] || [];
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}