import { NextApiRequest, NextApiResponse } from "next";
import { bigcommerceClient, getSession } from "@lib/auth";

export default async function products(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    body,
    query: { pid, metafieldId },
    method,
  } = req;
  switch (method) {
    case "DELETE":
      const { accessToken, storeHash } = await getSession(req);
      const bigcommerce = bigcommerceClient(accessToken, storeHash);
      const data = await bigcommerce.delete(`/catalog/products/${pid}/metafields/${metafieldId}`);

      res.status(200).json(data);

      break;
    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
