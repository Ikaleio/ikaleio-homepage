import { createRequestHandler } from '@react-router/express'
import express from 'express'
import 'react-router'

const app = express()

app.use(
	createRequestHandler({
		// @ts-expect-error - virtual module provided by React Router at build time
		build: () => import('virtual:react-router/server-build')
	})
)

export default app
