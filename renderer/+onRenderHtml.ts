// https://vike.dev/onRenderHtml
export { onRenderHtml };

import type { OnRenderHtmlAsync } from 'vike/types';

import { renderToNodeStream, renderToString as renderToString_ } from 'vue/server-renderer';
import { escapeInject } from 'vike/server';
import { createApp } from './app';
import logoUrl from './logo.svg';

const onRenderHtml: OnRenderHtmlAsync = async (pageContext): ReturnType<OnRenderHtmlAsync> => {
  const app = await createApp(pageContext);
  const stream = renderToNodeStream(app);
  // See https://vike.dev/head
  const { documentProps } = pageContext.exports;
  const title = (documentProps && documentProps.title) || 'Vite SSR app';
  const desc = (documentProps && documentProps.description) || 'App using Vite + Vike';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="app">${stream}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      enableEagerStreaming: true, // starts writing the HTML template right away before the page is loaded
    },
  };
};