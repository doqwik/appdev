const axios = require("axios");
class Telematics {
  static get(url, headers = {}) {
    return axios.get(url, {
      headers: {
        ...headers,
      },
    });
  }

  static post(url, body, headers = {}) {
    return axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  }

  static put(url, body) {
    return axios.put(url, body);
  }

  static delete(url) {
    return axios.delete(url);
  }
}

module.exports = Telematics;