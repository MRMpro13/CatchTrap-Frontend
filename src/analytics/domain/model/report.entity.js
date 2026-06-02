/**
 * Report entity within the Analytics bounded context.
 * @class Report
 */
export class Report {
  constructor({ id = null, title = '', date = '', totalInfractions = 0 }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.totalInfractions = totalInfractions;
  }
}