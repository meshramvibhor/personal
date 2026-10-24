import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT) || 3001
const allowedAnswers = new Set([
  'favoriteMemory',
  'whatToWorkOn',
  'missingMe',
  'futureTogether',
  'yourAnger',
  'forgiveness',
  'love',
  'juju',
])
const questionLabels = {
  favoriteMemory: 'Which memory made you smile most?',
  whatToWorkOn: 'What should Vibhor work on?',
  missingMe: 'Do you miss Vibhor?',
  futureTogether: 'Ready to face challenges together?',
  yourAnger: 'Will you work on your anger too?',
  forgiveness: 'Can you forgive him and have a fresh start?',
  love: 'Do you love him?',
  juju: 'Juju deeee?',
}
const requestsByIp = new Map()

app.use(express.json({ limit: '10kb' }))

app.post('/api/quiz', async (request, response) => {
  console.info(JSON.stringify({
    event: 'quiz.submission.received',
    timestamp: new Date().toISOString(),
  }))

  const now = Date.now()
  const recentRequests = (requestsByIp.get(request.ip) ?? []).filter((time) => now - time < 10 * 60 * 1000)

  if (recentRequests.length >= 5) {
    console.warn(JSON.stringify({ event: 'quiz.submission.rejected', reason: 'rate_limit' }))
    return response.status(429).json({ error: 'Too many quiz submissions. Please try again later.' })
  }

  recentRequests.push(now)
  requestsByIp.set(request.ip, recentRequests)

  const answers = request.body

  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    console.warn(JSON.stringify({ event: 'quiz.submission.rejected', reason: 'invalid_payload' }))
    return response.status(400).json({ error: 'Invalid quiz answers.' })
  }

  const receivedKeys = Object.keys(answers)
  if (
    receivedKeys.length !== allowedAnswers.size ||
    receivedKeys.some((key) => !allowedAnswers.has(key)) ||
    [...allowedAnswers].some((key) => typeof answers[key] !== 'string' || answers[key].trim().length === 0 || answers[key].length > 600)
  ) {
    console.warn(JSON.stringify({
      event: 'quiz.submission.rejected',
      reason: 'incomplete_or_unexpected_answers',
      receivedKeys,
    }))
    return response.status(400).json({ error: 'Please complete every quiz answer.' })
  }

  const submittedAt = new Date().toISOString()
  const formattedAnswers = Object.fromEntries(
    Object.entries(questionLabels).map(([key, label]) => [label, answers[key].trim()]),
  )

  console.info(JSON.stringify({
    event: 'quiz.answers.submitted',
    timestamp: submittedAt,
    answers: formattedAnswers,
  }))

  return response.json({ ok: true })
})

if (process.env.NODE_ENV === 'production') {
  const root = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.resolve(root, '../dist')
  app.use(express.static(distPath))
  app.get('/{*path}', (_request, response) => response.sendFile(path.join(distPath, 'index.html')))
}

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'

app.listen(port, host, () => {
  console.log(`Quiz answer logger listening on http://${host}:${port}`)
})
