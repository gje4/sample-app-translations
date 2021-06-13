import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function list(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        
        const { page, limit, keyword } = req.query;

        const { data, meta } = await bigcommerce.get(`/catalog/products?page=${page}&limit=${limit}&keyword=${keyword}`);
        res.status(200).json({ data, meta });
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).end(message || 'Authentication failed, please re-install');
    }
}
