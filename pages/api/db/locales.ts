import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@lib/auth";
import db from "../../../lib/db";

export default async function locales(req: NextApiRequest, res: NextApiResponse) {
  const { body, method } = req;
  const { storeHash } = await getSession(req);
  
  switch(method) {
    case "GET":
      try {
        const locales = await db.getDbLocales(storeHash);

        res.status(200).json(locales);
      } catch (error) {
        const { message, response } = error;
        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    case "PUT":
      try {
        console.log('request body: ', body);
        await db.addDbLocale(storeHash, JSON.parse(body));

        res.status(200).json(body);
      } catch (error) {
        const { message, response } = error;
        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
