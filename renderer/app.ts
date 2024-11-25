import type { PageContext } from 'vike/types';
import { createSSRApp, defineComponent, h, markRaw, reactive } from 'vue';
import LayoutDefault from './PageShell.vue';
import { setPageContext } from './usePageContext';

export { createApp };

async function createApp(pageContext: PageContext) {
  const { Page } = pageContext;

  const rootComponent = reactive({
    Page: markRaw(Page),
    pageProps: markRaw(pageContext.pageProps || {}),
    Layout: markRaw(pageContext.config.Layout || LayoutDefault),
  });

  const PageWithWrapper = defineComponent({
    setup() {
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

  // We use `app.changePage()` to do Client Routing, see `+onRenderClient.ts`
  objectAssign(app, {
    changePage: (pageContext: PageContext) => {
      Object.assign(pageContextReactive, pageContext);
      rootComponent.Page = markRaw(pageContext.Page);
      rootComponent.pageProps = markRaw(pageContext.pageProps || {});
      rootComponent.Layout = markRaw(
        pageContext.config.Layout || LayoutDefault
      );
    },
  });

  // Make `pageContext` accessible from any Vue component, and make it reactive
  const pageContextReactive = reactive(pageContext);
  setPageContext(app, pageContextReactive);

  return app;
}

// Same as `Object.assign()` but with type inference
function objectAssign<Obj extends object, ObjAddendum>(
  obj: Obj,
  objAddendum: ObjAddendum
): asserts obj is Obj & ObjAddendum {
  Object.assign(obj, objAddendum);
}
