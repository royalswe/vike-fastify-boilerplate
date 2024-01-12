import type { PageContext } from 'vike/types'
import type { Component } from './types'
import { createSSRApp, defineComponent, h, markRaw, reactive } from 'vue';
import LayoutDefault from './PageShell.vue'
import { setPageContext } from './usePageContext'

export { createApp }

function createApp(Page: Component, pageContext: PageContext) {

  const rootComponent = reactive({
    Page: markRaw(Page),
    pageProps: markRaw(pageContext.pageProps || {}),
    Layout: markRaw(LayoutDefault),
  });

  const PageWithWrapper = defineComponent({
    setup() {
      rootComponent;
      return () => {
        return h(
          rootComponent.Layout,
          {},
          {
            default: () => {
              return h(rootComponent.Page, rootComponent.pageProps);
            },
          }
        );
      };
    },
  });

  const app = createSSRApp(PageWithWrapper);

  // Make pageContext available from any Vue component
  setPageContext(app, pageContext)

  return app
}
