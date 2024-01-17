# Vike boilerplate from [https://vike.dev/](https://vike.dev/scaffold) with fastify instead off express.

This example uses vue but the changes is not UI framework dependent.

If you do not want https then just remove
```
  https: {
    key: (await import('fs')).readFileSync('cert/dev.pem'),
    cert: (await import('fs')).readFileSync('cert/cert.pem'),
  },
```

install: `npm i`

run: `npm run dev`