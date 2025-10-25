import axios from "axios";
import Cookies from "js-cookie";

const request = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_HOST}/api/v1`,
  timeout: 60000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Credentials": "true",
  },
});

const requestHandler = (req) => {
  const token = Cookies.get("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
};

const responseHandler = (response) => {
  return response;
};

const expiredTokenHandler = () => {
  try {
    localStorage.clear();
    Cookies.remove("token");
    window.location.href = "/login";
  } catch (err) {
    console.error("Error handling expired token:", err);
  }
};

const errorHandler = (error) => {
  try {
    if (error.response && error.response.status === 401) {
      expiredTokenHandler();
    } else if (error.code === "ERR_NETWORK") {
      console.warn("Network error:", error.message);
      window.history.pushState({}, "Redirect Network Error", "/login");
      if (error.response?.status === 401) {
        expiredTokenHandler();
      }
    }
  } catch (err) {
    console.error("Error in request errorHandler:", err);
  }

  // biar tetap bisa .catch()
  return Promise.reject(error);
};

request.interceptors.request.use(
  (req) => requestHandler(req),
  (error) => errorHandler(error)
);

request.interceptors.response.use(
  (res) => responseHandler(res),
  (error) => errorHandler(error)
);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  get: (url, params = null, headers = {}) =>
    request({ method: "get", url, params, headers }),
  post: (url, data, headers = {}) =>
    request({ method: "post", url, data, headers }),
  put: (url, data, headers = {}) =>
    request({ method: "put", url, data, headers }),
  patch: (url, data, headers = {}) =>
    request({ method: "patch", url, data, headers }),
  delete: (url, data) => request({ method: "delete", url, data }),
  setToken: (token) => {
    if (token) {
      request.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete request.defaults.headers.common.Authorization;
    }
  },
};
