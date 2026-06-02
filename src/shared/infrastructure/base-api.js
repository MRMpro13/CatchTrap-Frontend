import axios from "axios";

const platformApi = import.meta.env.VITE_CATCHTRAP_API_URL || "http://localhost:3000/api/v1";

/**
 * Shared infrastructure base class that configures the HTTP client.
 * @class BaseApi
 */
export class BaseApi {
  #http;

  constructor() {
    this.#http = axios.create({
      baseURL: platformApi,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  get http() {
    return this.#http;
  }
}