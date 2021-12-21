import { NextApiRequest, NextApiResponse } from 'next';
import { encodePayload, getBCVerify, setSession } from '../../lib/auth';

const buildRedirectUrl = (url: string, encodedContext: string) => {
    const [path, query = ''] = url.split('?');
    const queryParams = new URLSearchParams(`context=${encodedContext}&${query}`);
    
    return `${path}?${queryParams}`;
}

export default async function load(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getBCVerify(req.query);
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering
        console.log(encodedContext)
        console.log(session.url)
        await setSession(req, res, session);
        res.redirect(302, buildRedirectUrl(session.url, encodedContext));
    } catch (error) {
        const { message, response } = error;
        console.log(message)
        res.status(response?.status || 500).json(message);
    }
}
