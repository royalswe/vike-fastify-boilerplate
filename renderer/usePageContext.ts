// `usePageContext` allows us to access `pageContext` in any Vue component.
// See https://vike.dev/pageContext-anywhere
import type { App, Reactive } from 'vue';
import type { PageContext } from 'vike/types';
import { inject } from 'vue';

export { usePageContext };
export { setPageContext };

const key = Symbol();

function usePageContext() {
  const pageContext = inject(key);
  if (!pageContext) throw new Error('setPageContext() not called in parent');
  return pageContext;
}

function setPageContext(app: App, pageContext: Reactive<PageContext>) {
  app.provide(key, pageContext);
}
