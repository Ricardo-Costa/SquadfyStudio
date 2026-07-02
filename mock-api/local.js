// Local dev entry point — Vercel deploys api's exported Express app directly
// (see index.js), but running it locally needs an actual .listen() call.
const app = require('./index')

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Squadfy mock API listening on http://localhost:${PORT}`)
})
