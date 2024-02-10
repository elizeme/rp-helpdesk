import axios from "axios";
import ErrorResponse from "../../utils/errorResponse";
import { StatusCodes } from "../../utils/statusCodes";
//${userId}/accounts?access_token=${accessToken}
const clientId = "1562768337851537",
  clientSecret = "157d86e78b8985242e392be1fe7e0dfe",
  userAccessToken =
    "EAAWNVFuk1JEBOyVdh7pY9QJQicGLmfgifpo9gCqSS5ZB7YrhzbZA7lQQCEDlzZAyXZBZA24xUNnkxbbZB6VtJt8KxvcIME89uGpXkCEAJSskqcFZCZB3P50dIFjpc25HsUZCXkjF92yseR3mO7yr0wdn3ZC3x6ZClmWxSQDNoCBMQZCZABVahH8jVO17yUZBq2QEYRyBZC1snwD8YsZD",
  appAccessToken = "1562768337851537|uHhhDlXVeUjb_99eFpuJXFd53Ck",
  pageAccessToken =
    "EAAWNVFuk1JEBOyVdh7pY9QJQicGLmfgifpo9gCqSS5ZB7YrhzbZA7lQQCEDlzZAyXZBZA24xUNnkxbbZB6VtJt8KxvcIME89uGpXkCEAJSskqcFZCZB3P50dIFjpc25HsUZCXkjF92yseR3mO7yr0wdn3ZC3x6ZClmWxSQDNoCBMQZCZABVahH8jVO17yUZBq2QEYRyBZC1snwD8YsZD",
  pageId = "235391469654675",
  userId = "3818175045136380";
const baseUrl = `https://graph.facebook.com/v19.0`;

const fbService = {
  getUserDetails: async function () {
    try {
      const response = await axios.get(`${baseUrl}/me`);
      return response;
    } catch (err) {
      throw new ErrorResponse("cannot upload media", StatusCodes.NOT_FOUND);
    }
  },

  sendOnMessenger: async function (
    data: any,
    pageId: string,
    pageAccessToken: any
  ) {
    try {
      const response = await axios.post(
        `${baseUrl}/${pageId}/messages?access_token=${pageAccessToken}}`,
        data
      );
      return response.data;
    } catch (err) {
      console.log("err", err);
      throw new ErrorResponse("cannot upload media", StatusCodes.NOT_FOUND);
    }
  },

  getAppAccessToken: async function () {
    try {
      const response = await axios.get(
        `${baseUrl}/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
      );
      return response.data;
    } catch (err) {
      console.log("err", err);
      throw new ErrorResponse("Cant", StatusCodes.NOT_FOUND);
    }
  },

  getPages: async function (userId: any, userAccessToken: any) {
    try {
      const response = await axios.get(
        `${baseUrl}/${userId}/accounts?access_token=${userAccessToken}`
      );
      return response.data.data;
    } catch (err) {
      console.log("err", err);
      throw new ErrorResponse("Cant", StatusCodes.NOT_FOUND);
    }
  },

  generateFeedAccess: async function (pages: any) {
    const data = { subscribed_fields: ["feed", "messages", "group_feed"] };

    // console.log("pages", pages);
    pages.forEach((page: any) => {
      console.log("pppppp", pages);
      const response = axios.post(
        `${baseUrl}/${userId}/${page.id}/subscribed_apps?access_token=${page.access_token}`,
        data
      );
    });
    return;
  },

  getCustomer: async function (userId: any, accessToken: any) {
    try {
      const response = await axios.get(
        `${baseUrl}/${userId}?access_token=${accessToken}`
      );
      return response.data;
    } catch (err) {
      console.log("err", err);
      throw new ErrorResponse("Cant get customer", StatusCodes.NOT_FOUND);
    }
  },
};

export default fbService;
// EAAPgi3Wk9G0BO5c4WOAxOGxL1xpz77tbMA95ELTaZAnVem6CvDoE84EZANmBXOCbxp6ej0CpALT9XMBSDJj2SkDe3IWuCE1UJSYE38WZA4DlbZAjFjqvaiZCpFPAuh1C3eZCLjsZAOfkTsgPcTdzDO6O7DdFzk4y5ZCSyqIPLnVjV9ca78S6P0Vk9aEOYziIdhT16b4KTGfS
