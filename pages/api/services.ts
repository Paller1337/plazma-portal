// pages/api/services.ts
import { DEFAULTS } from 'defaults';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ServicesResponse } from 'types/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const strapiRes = await fetch(`${DEFAULTS.STRAPI.url}/api/services?populate=*`);
        if (!strapiRes.ok) {
            throw new Error(`Error from Strapi: ${strapiRes.status}`);
        }
        const data = await strapiRes.json() as ServicesResponse;
        res.status(200).json(data);
        data.data[0].attributes.title
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
