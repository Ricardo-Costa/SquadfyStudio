const fs = require('fs')
const jsonServer = require('json-server')
const seed = require('../db.json')

// /tmp is the only writable directory in a Vercel Function — and it's ephemeral:
// it can reset on any cold start, redeploy, or when a request lands on a
// different warm instance. That's expected here (interview/demo fixture, not
// real persistence) — each cold start gets a fresh copy of the seed data.
const DB_PATH = '/tmp/db.json'

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2))
}

const server = jsonServer.create()
const router = jsonServer.router(DB_PATH)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

module.exports = server
