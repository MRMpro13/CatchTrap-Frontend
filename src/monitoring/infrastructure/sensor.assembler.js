import {Sensor} from "../domain/model/sensor.entity.js";

/**
 * Maps sensors resources into domain entities.
 * @class SensorAssembler
 */
export class SensorAssembler {
  static toEntityFromResource(resource) {
    return new Sensor({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array ? response.data : response.data['sensors'] || [];
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}