import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      headers.set('Access-Control-Allow-Origin', '*')

      const token = await getDecryptedToken();
      console.log("🚀 ~ createBaseQuery ~ token:", token)

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  });
};

export default createBaseQuery;


