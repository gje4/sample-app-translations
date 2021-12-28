import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@lib/auth";
import db from "../../../lib/db";

export default async function locales(req: NextApiRequest, res: NextApiResponse) {
  const { body, method } = req;
  const { storeHash } = await getSession(req);
  
  switch(method) {
    case "PUT":
      try {
        const { useConciseMetafieldStorage } = JSON.parse(body);
        console.log('Updating firebase with concise setting: ', useConciseMetafieldStorage);
        await db.updateConciseStorage(storeHash, useConciseMetafieldStorage);

        res.status(200).json({message: 'success'});
      } catch (error) {
        const { message, response } = error;
        console.log(error);

        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    default:
      res.setHeader("Allow", ["PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
