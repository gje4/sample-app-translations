import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";

export default async function store(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch(method) {
    case "GET":
      try {
        const storeData = await db.getStore();

        res.status(200).json(storeData);
      } catch (error) {
        const { message, response } = error;
        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
