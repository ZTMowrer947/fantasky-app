import { Request, Response } from 'express';
import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Layout from '@/components/Layout';

export default function renderPage(
  req: Request,
  res: Response,
  node: ReactNode
) {
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <Layout
      path={req.path}
      userName={res.locals.userName}
      title={res.locals.title}
    >
      {node}
    </Layout>
  )}`;
}
