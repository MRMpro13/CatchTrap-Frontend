import axios from "axios";

const platformApi = import.meta.env.VITE_CATCHTRAP_API_URL || "https://catchtrap-mockapi.azure-api.net/api/v1";
const platformApiKey = import.meta.env.VITE_CATCHTRAP_API_KEY;

export class BaseApi {
  #http;

  constructor() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (platformApiKey) {
      headers['Ocp-Apim-Subscription-Key'] = platformApiKey;
    }

    this.#http = axios.create({
      baseURL: platformApi,
      headers
    });
  }

  get http() {
    return this.#http;
  }
}