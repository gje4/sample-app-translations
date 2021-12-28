import { NextApiRequest, NextApiResponse } from "next";
import { bigcommerceClient, getSession } from "@lib/auth";

export default async function locale(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce = bigcommerceClient(accessToken, storeHash);
    const locale = await bigcommerce.get('/settings/store/locale');

    res.status(200).json(locale);
  } catch (error) {
    const { message, response } = error;
    res
      .status(response?.status || 500)
      .end(message || "Authentication failed, please re-install");
  }
}
