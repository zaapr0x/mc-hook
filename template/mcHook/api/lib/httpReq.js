import {
  HttpRequest,
  HttpRequestMethod,
  HttpHeader,
  http,
} from "@minecraft/server-net";

/**
 * Sends an HTTP request using a configuration object.
 * @function httpReq
 * @param {Object} config - Configuration for the HTTP request.
 * @param {string} config.url - The target URL for the request.
 * @param {string} [config.method="GET"] - The HTTP method (GET, POST, PUT, DELETE, HEAD).
 * @param {Object|string} [config.body] - The request body (also accepts `data` for compatibility).
 * @param {Object} [config.headers={}] - Key-value pairs for request headers.
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq({ url: 'https://example.com/api', method: 'GET' })
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error.message));
 */
async function httpReq(config) {
  // Normalize configuration, supporting both `body` and `data`
  const { url, method = "GET", data, body = data, headers = {} } = config;

  if (!url) {
    throw new Error("URL is required");
  }

  // Initialize HTTP request
  const request = new HttpRequest(url);

  // Configure request method
  switch (method.toUpperCase()) {
    case "GET":
      request.method = HttpRequestMethod.Get;
      break;
    case "POST":
      request.method = HttpRequestMethod.Post;
      break;
    case "PUT":
      request.method = HttpRequestMethod.Put;
      break;
    case "DELETE":
      request.method = HttpRequestMethod.Delete;
      break;
    case "HEAD":
      request.method = HttpRequestMethod.Head;
      break;
    default:
      request.method = HttpRequestMethod.Get;
  }

  // Configure request body
  if (body !== undefined && body !== null) {
    if (typeof body === "object") {
      request.body = JSON.stringify(body);
      // Set default Content-Type for JSON if not specified
      if (!headers["Content-Type"] && !headers["content-type"]) {
        headers["Content-Type"] = "application/json";
      }
    } else {
      request.body = body;
    }
  }

  // Configure request headers
  if (Object.keys(headers).length > 0) {
    request.headers = Object.entries(headers).map(
      ([key, value]) => new HttpHeader(key, value)
    );
  }

  // Execute request and process response
  try {
    const response = await http.request(request);
    return {
      status: response.status,
      data: response.body ? JSON.parse(response.body) : null,
      headers: response.headers,
    };
  } catch (error) {
    throw new Error(`HTTP request failed: ${error.message}`);
  }
}

/**
 * Sends a GET request to the specified URL.
 * @function httpReq.get
 * @param {string} url - The target URL for the request.
 * @param {Object} [config={}] - Additional configuration (e.g., headers).
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq.get('https://example.com/api')
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error.message));
 */
httpReq.get = async function (url, config = {}) {
  return httpReq({ url, method: "GET", ...config });
};

/**
 * Sends a POST request to the specified URL with a body.
 * @function httpReq.post
 * @param {string} url - The target URL for the request.
 * @param {Object|string} body - The request body.
 * @param {Object} [config={}] - Additional configuration (e.g., headers).
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq.post('https://example.com/api', { key: 'value' })
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error.message));
 */
httpReq.post = async function (url, body, config = {}) {
  return httpReq({ url, method: "POST", body, ...config });
};

/**
 * Sends a PUT request to the specified URL with a body.
 * @function httpReq.put
 * @param {string} url - The target URL for the request.
 * @param {Object|string} body - The request body.
 * @param {Object} [config={}] - Additional configuration (e.g., headers).
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq.put('https://example.com/api/1', { key: 'updated' })
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error.message));
 */
httpReq.put = async function (url, body, config = {}) {
  return httpReq({ url, method: "PUT", body, ...config });
};

/**
 * Sends a DELETE request to the specified URL.
 * @function httpReq.delete
 * @param {string} url - The target URL for the request.
 * @param {Object} [config={}] - Additional configuration (e.g., headers, body).
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq.delete('https://example.com/api/1')
 *   .then(response => console.log(response.status))
 *   .catch(error => console.error(error.message));
 */
httpReq.delete = async function (url, config = {}) {
  return httpReq({ url, method: "DELETE", ...config });
};

/**
 * Sends a HEAD request to the specified URL.
 * @function httpReq.head
 * @param {string} url - The target URL for the request.
 * @param {Object} [config={}] - Additional configuration (e.g., headers).
 * @returns {Promise<Object>} A promise resolving to an object with `status`, `data`, and `headers` properties.
 * @throws {Error} If the URL is missing or the request fails.
 * @example
 * httpReq.head('https://example.com/api')
 *   .then(response => console.log(response.headers))
 *   .catch(error => console.error(error.message));
 */
httpReq.head = async function (url, config = {}) {
  return httpReq({ url, method: "HEAD", ...config });
};

export default httpReq;
