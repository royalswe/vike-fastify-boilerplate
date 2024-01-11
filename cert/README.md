### Trusting certificate problem

This has nothing to do with Vike but with nodejs environment safety.
set `NODE_TLS_REJECT_UNAUTHORIZED` as a environment variable with the value `0`
in code inside the project
`process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';`

### Copy certificate and key to cert folder

Copy your certificate and key created by mkcert (created when running npm run dev) from C:\Users\[USER]\.vite-plugin-mkcert to the cert folder.

### OR install mkcert (https://github.com/FiloSottile/mkcert)

and then run: `mkcert localhost 127.0.0.1 ::1`
this will generate localhost+2.pem and localhost+2-key.pem which you can rename
