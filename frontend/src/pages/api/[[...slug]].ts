import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../../../backend/server';

export const config = {
  api: {
    bodyParser: false, // Express handles the body parsing
    externalResolver: true, // Let Express handle the response
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req, res);
}
