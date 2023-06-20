import axios from "axios";
import { Buffer } from "buffer";

const HOST_URL = "api/";

// async function sendApi({
//   method,
//   url,
//   data = {},
//   header = {}
// }: {
//   method: string;
//   url: string;
//   data: object;
// }) {
//   url = `${HOST_URL}${url}`;
//   return await axios({ method, url, data });
// }

export async function hello() {
  return await axios({ method: "get", url: `${HOST_URL}}` });
}

export async function signup(account: string, password: string) {
  return await axios({
    method: "post",
    url: `${HOST_URL}user/`,
    data: { account, password },
  });
}

export async function login(account: string, password: string) {
  const token = Buffer.from(`${account}:${password}`).toString("base64");
  return await axios({
    method: "post",
    url: `${HOST_URL}auth/login`,
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
}
