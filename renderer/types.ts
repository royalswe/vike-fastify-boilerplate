import type { DefineComponent } from 'vue';

export type { PageProps };
export type { Component };

// https://vike.dev/pageContext#typescript
declare global {
  namespace Vike {
    interface PageContext {
      Page: Page;
      pageProps?: PageProps;
      urlPathname: string;
      config: {
        /** Title defined statically by /pages/some-page/+title.js (or by `export default { title }` in /pages/some-page/+config.js) */
        title?: string;
        Layout?: DefineComponent;
      };
      exports: {
        documentProps?: {
          title?: string;
          description?: string;
        };
      };
    }
  }
}

import type { ComponentPublicInstance } from 'vue';

type Component = ComponentPublicInstance; // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086
type Page = Component;
type PageProps = {};
