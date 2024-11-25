// https://vike.dev/onRenderClient
import type { PageContext } from 'vike/types';
import type { App } from 'vue';
import { createApp } from './app';

export { onRenderClient };

// This onRenderClient() hook only supports SSR, see https://vike.dev/render-modes for how to modify onRenderClient() to support SPA
let app: App<Element> & { changePage: (pageContext: PageContext) => void; };

async function onRenderClient(pageContext: PageContext) {
  if (!app) {
    app = await createApp(pageContext);
    app.mount('#app');
  } else {
    // Update language in i18n
    // if app allready exists, just update pageContext
    app.changePage(pageContext);
  }
}



