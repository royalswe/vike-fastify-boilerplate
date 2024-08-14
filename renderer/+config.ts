import type { Config } from 'vike/types';

// https://vike.dev/config
export default {
  // See https://vike.dev/clientRouting
  clientRouting: true,

  // See https://vike.dev/data-fetching
  passToClient: ['pageProps', 'urlPathname']
} satisfies Config;
