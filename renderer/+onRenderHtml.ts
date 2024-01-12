// https://vike.dev/onRenderHtml
export { onRenderHtml };

import type { App } from 'vue';
import type { OnRenderHtmlAsync } from 'vike/types';

import { renderToNodeStream, renderToString as renderToString_ } from 'vue/server-renderer';
import { escapeInject, dangerouslySkipEscape } from 'vike/server';
import { createApp } from './app';
import logoUrl from './logo.svg';

const onRenderHtml: OnRenderHtmlAsync = async (pageContext): ReturnType<OnRenderHtmlAsync> => {
  const { Page } = pageContext;
  // This onRenderHtml() hook only supports SSR, see https://vike.dev/render-modes for how to modify
  // onRenderHtml() to support SPA
  if (!Page) throw new Error('My render() hook expects pageContext.Page to be defined');
  const app = createApp(Page, pageContext);

  const appHtml = renderToNodeStream(app);

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
        <div id="app">${appHtml}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      enableEagerStreaming: true, // starts writing the HTML template right away before the page is loaded
    },
  };
};

async function renderToString(app: App) {
  let err: unknown;
  // Workaround: renderToString_() swallows errors in production, see https://github.com/vuejs/core/issues/7876
  app.config.errorHandler = (err_) => {
    err = err_;
  };
  const appHtml = await renderToString_(app);
  if (err) throw err;
  return appHtml;
}
