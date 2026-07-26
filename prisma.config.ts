import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  studio: { port: 5555 },
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL,
  },
  migrations: {
    url: process.env.POSTGRES_URL_NON_POOLING,
  }
})
