import { useEffect, useRef, useState } from 'react'
import './App.css'

const floatingHearts = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: `${(index * 13) % 100}%`,
  delay: `${(index % 5) * 0.9}s`,
  duration: `${6 + (index % 5) * 1.8}s`,
  size: `${16 + (index % 5) * 10}px`,
}))

const sparkles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 11 + 8) % 100}%`,
  delay: `${(index % 7) * 0.7}s`,
  duration: `${4 + (index % 5) * 1.6}s`,
  scale: `${0.7 + (index % 4) * 0.35}`,
}))

const memoryNotes = [
  'The first time we went out on Juhu beach, our first photo shoot. 🏖️📸',
  'The new year we celebrated, what a night, all was going perfect until - wo dono tamashe start kiye. 🎆😂',
  'The official first picture we clicked together, subah subah uthate sath hi. Terko yaad hai wo raat hum kya kiye the? 🌅😉',
  'Marine drive, it was fun too, khudko dekh kitni khush lagg rhi mere sath. 🌊😊',
  'Khushi to dekho, vaise ye mall me le kr q gayi thi mrko? 🛍️😄',
  'Mai tujhse jyada smart dikh rha hu, lekin tu khush mujhse jyada dikh rhi hai. 😎😂',
  'Ye flowers yad hai? 💐🥰',
  'Pune ka wo hotel, kya mast tha yrr. 🏨✨',
  'Tu pkka mere lap par hi baithi hai na... 😏❤️',
  'Abb tu aise dekhegi merko to mai to pagal ho hi jaunga naa. 🥰😍',
  'Ye meri favourite picture hai. 💖📸',
  'I miss those days. 🥺💭',
  'Ye kya gundagiri hai teri? 😈😂',
  'Hum kya lagg rhe hai sath me, height thodi chhoti hai but thik hai. 👫😄',
  'Abhi na jao chhod karr, k dil abhii bhara nahii. 🎶🥺',
  'That booty is mine, mine only. 🍑😉',
  'Ye wo fort, jaha humko loota gya tha, bc vo taxi vala. But It was fun 🏰🚕😂',
  'Ye aise jbrdsti q pakad rhi thi mrko tu? 🤗😂',
  'Ye dekho ,lol 😂📸',
  'Kiss v camera ko dena hai? 💋📸',
  'Aisa sona mujhe v sikha de 😴💤',
  'I remeber this day, it was all tiring but with you it all feels like worth it. 🥹❤️',
  'The day I introduced you to my boss, he was so happy and told me never leave her, she is such a jolly person. 👔😊',
  'When you came to Nagpur to meet me, I was so happy and I was like, I will never let you go. 🚆❤️',

]

const memories = [
  'IMG_0484.jpeg', 'IMG_1336.jpeg', 'IMG_2538.JPG', 'IMG_2727.jpeg', 'IMG_2835.JPG',
  'IMG_3483.JPG', 'IMG_3956.jpeg', 'IMG_4023.jpeg', 'IMG_4025.jpeg', 'IMG_4031.jpeg',
  'IMG_4129.JPG', 'IMG_4178.jpeg', 'IMG_4337.jpeg', 'IMG_4415.jpeg', 'IMG_4423.jpeg',
  'IMG_4426.jpeg', 'IMG_4541.jpeg', 'IMG_4551.jpeg', 'IMG_4586.jpeg', 'IMG_4607.jpeg',
  'IMG_4697.jpeg', 'IMG_4698.jpeg', 'IMG_4979.jpeg', 'IMG_5379.jpeg',
].map((filename, index) => ({
  image: `/memories-web/${filename.replace(/\.(jpe?g|png)$/i, '.webp')}`,
  note: memoryNotes[index % memoryNotes.length],
}))

const quizQuestions = [
  {
    id: 'favoriteMemory',
    prompt: 'Of all the memories above, which one made you smile the most and feel happiest?💛',
    placeholder: 'Pick any one of our little moments...',
    maxLength: 500,
    multiline: true,
  },
  {
    id: 'whatToWorkOn',
    prompt: 'What’s one thing you think I should work on so we don’t keep ending up in the same fight? I really want to listen. 💌',
    placeholder: 'You can tell me honestly...',
    maxLength: 600,
    multiline: true,
  },
  {
    id: 'missingMe',
    prompt: 'It’s been a long time since you went abroad… do you miss me and the way we used to feel seen, loved, happy together? 🥺',
    placeholder: 'Tell me what’s in your heart...',
    maxLength: 500,
    multiline: true,
  },
  {
    id: 'futureTogether',
    prompt: 'I know we have challenges, but if we stand by each other, I believe we can work through them. Will you believe in me—and in us—and lets face them together? ❤️',
    placeholder: '',
    maxLength: 500,
    multiline: true,
  },
  {
    id: 'yourAnger',
    prompt: 'And madam, can you work on your anger too? I promise I’ll work on mine—team effort, okay? 😇',
    placeholder: 'Deal? 😏',
    maxLength: 400,
    multiline: true,
  },
  {
    id: 'forgiveness',
    prompt: 'And one last, important thing… can you forgive me for my aggressive behaviour and I promise I will understand your situation without putting pressure on you.🥺',
    placeholder: '',
    maxLength: 500,
    multiline: true,
  },
  {
    id: 'love',
    prompt: 'I love you sooooooooooooo mucccccccchhhhhhh! Do you love me? 🥰',
    placeholder: '',
    maxLength: 300,
    multiline: true,
  },
  {
    id: 'juju',
    prompt: 'And lastly… juju deeee? 😘',
    placeholder: '',
    maxLength: 300,
  },
]

const QUIZ_WORKER_URL = 'https://yellow-frog-2895.meshramvibhor.workers.dev/api/quiz'

function RevealSection({ children, className, ...sectionProps }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    if (!('IntersectionObserver' in window)) {
      section.classList.add('is-visible')
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add('is-visible')
        observer.unobserve(section)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      {...sectionProps}
      ref={sectionRef}
      className={`scroll-reveal ${className}`}
    >
      {children}
    </section>
  )
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [adultChoice, setAdultChoice] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState(() =>
    Object.fromEntries(quizQuestions.map(({ id }) => [id, ''])),
  )
  const [quizStep, setQuizStep] = useState(0)
  const [quizStatus, setQuizStatus] = useState('idle')
  const [quizError, setQuizError] = useState('')
  const touchStartX = useRef(null)

  const nextMemory = () => setActiveIndex((index) => (index + 1) % memories.length)
  const prevMemory = () => setActiveIndex((index) => (index - 1 + memories.length) % memories.length)
  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX
  }
  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return

    const swipeDistance = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(swipeDistance) > 45) {
      if (swipeDistance < 0) nextMemory()
      else prevMemory()
    }

    touchStartX.current = null
  }
  const activeMemory = memories[activeIndex]

  const submitQuiz = async (event) => {
    event.preventDefault()

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep((step) => step + 1)
      return
    }

    setQuizStatus('sending')
    setQuizError('')

    const answers = quizQuestions.map(({ id, prompt }) => ({
      question: prompt,
      answer: quizAnswers[id],
    }))

    try {
      const response = await fetch(QUIZ_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || `Worker returned ${response.status}`)
      }

      setQuizStatus('sent')
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Could not reach the quiz service.')
      setQuizStatus('error')
    }
  }
  const activeQuestion = quizQuestions[quizStep]

  return (
    <main className="apology-page">
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />
      <div className="floating-hearts" aria-hidden="true">
        {floatingHearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              fontSize: heart.size,
            }}
          >
            ❤
          </span>
        ))}
      </div>
      <div className="sparkles" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="sparkle"
            style={{
              left: sparkle.left,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
              transform: `scale(${sparkle.scale})`,
            }}
          />
        ))}
      </div>

      <section className="letter-card">
        <section className="apology-section" aria-labelledby="apology-title">
          <div className="badge-row">
            <span className="mini-badge">💌 for you</span>
            <span className="mini-badge">I miss us</span>
          </div>

          <img
            className="apology-gif"
            src="/cute-sad-bubu-dudu-panda-kick-4cn5usy9xip1m59y.gif"
            alt="A cute, sad Bubu Dudu bear"
          />

          <p className="eyebrow">My heart is here</p>
          <h1 id="apology-title">I'm sorry, Aashu.</h1>

          <p className="intro">
            Aashu, I know you left your job and everything familiar in India to be
            there for your sister and the twins. You’ve been exhausted, not sleeping
            properly, and carrying so much uncertainty about your career and what
            comes next. I’m sorry I didn’t understand how heavy this has been for you.
            I missed you and wanted to feel important in your life, but during our
            fight I let that hurt turn into anger and said things I should never have
            said. That wasn’t fair to you, and none of your struggles excuse how I
            spoke. I’m truly sorry. You deserve my patience, support, and understanding
            too.
          </p>

        </section>

        <RevealSection className="memory-album" aria-labelledby="album-title">
          <div className="album-header">
            <span className="album-tag">Our little time capsule ✨</span>
            <h2 id="album-title">Remember this?</h2>
            <p className="album-intro">
              <span className="swipe-directions" aria-hidden="true">← &nbsp; SWIPE &nbsp; →</span>
            </p>
          </div>

          <div className="carousel-shell">
            <div
              className="carousel-track"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <article className="memory-card active" aria-live="polite">
                <img
                  src={activeMemory.image}
                  alt="A photo from our memories"
                  loading="lazy"
                  decoding="async"
                />
                <div className="memory-caption">
                  <p>{activeMemory.note}</p>
                </div>
              </article>
            </div>
          </div>

        </RevealSection>

        <RevealSection className="naughty-section" aria-labelledby="naughty-title">
          <p className="eyebrow">Psst... 🙈</p>
          <h2 id="naughty-title">One little question for you</h2>
          <p className="naughty-prompt">
            Want to see some cozy, lovey-dovey pictures of us? 👀
          </p>
          <p className="age-question">For those cozy pictures, are you 18 or older?</p>
          <div className="age-actions">
            <button
              className={adultChoice === true ? 'age-button is-selected' : 'age-button'}
              onClick={() => setAdultChoice(true)}
              aria-pressed={adultChoice === true}
            >
              Yes, I’m 18+
            </button>
            <button
              className={adultChoice === false ? 'age-button is-selected' : 'age-button'}
              onClick={() => setAdultChoice(false)}
              aria-pressed={adultChoice === false}
            >
              No
            </button>
          </div>
          {adultChoice === true && (
            <p className="naughty-reveal" aria-live="polite">
              Dhappa! Nahi nahi 😜 Aisi pictures idhar nahi daalte... DM mein bhejta hoon 😉
              <span> (aur tu 18+ nahi 28+ hai)</span>
            </p>
          )}
          {adultChoice === false && (
            <p className="naughty-reveal" aria-live="polite">
              Horlicks piyo... tumko toh zarurat bhi hai 😜🥛
            </p>
          )}
        </RevealSection>

        <RevealSection className="quiz-section" aria-labelledby="quiz-title">
          {quizStatus === 'sent' ? (
            <h2 id="quiz-title" role="status">Answers submitted 💌</h2>
          ) : (
            <>
              <p className="eyebrow">One tiny quiz 💌</p>
              <h2 id="quiz-title">Assignment time, madam 😏</h2>
              <p className="quiz-disclosure">Your answers will be sent securely to Vibhor’s quiz logger 💛</p>
              <form className="quiz-form" onSubmit={submitQuiz}>
                <div className="quiz-question" key={activeQuestion.id}>
                  <p className="quiz-step-label">A little question {quizStep + 1} ✨</p>
                  <label htmlFor={`quiz-${activeQuestion.id}`}>
                    {activeQuestion.prompt}
                    {activeQuestion.multiline ? (
                      <textarea
                        id={`quiz-${activeQuestion.id}`}
                        value={quizAnswers[activeQuestion.id]}
                        onChange={(event) => setQuizAnswers({ ...quizAnswers, [activeQuestion.id]: event.target.value })}
                        required
                        maxLength={activeQuestion.maxLength}
                        rows={3}
                        placeholder={activeQuestion.placeholder}
                      />
                    ) : (
                      <input
                        id={`quiz-${activeQuestion.id}`}
                        type="text"
                        value={quizAnswers[activeQuestion.id]}
                        onChange={(event) => setQuizAnswers({ ...quizAnswers, [activeQuestion.id]: event.target.value })}
                        required
                        maxLength={activeQuestion.maxLength}
                        placeholder={activeQuestion.placeholder}
                      />
                    )}
                  </label>
                </div>
                <div className="quiz-navigation">
                  {quizStep > 0 && (
                    <button className="quiz-back" type="button" onClick={() => setQuizStep((step) => step - 1)}>
                      Back
                    </button>
                  )}
                  <button className="quiz-submit" type="submit" disabled={quizStatus === 'sending'}>
                    {quizStatus === 'sending'
                      ? 'Submitting…'
                      : quizStep === quizQuestions.length - 1
                        ? 'Submit answers'
                        : 'Next question'}
                  </button>
                </div>
                {quizStatus === 'error' && (
                  <p className="quiz-feedback quiz-error" role="alert">
                    Couldn’t submit: {quizError}
                  </p>
                )}
              </form>
            </>
          )}
        </RevealSection>

        <RevealSection className="final-moment" aria-labelledby="final-moment-title">
          <p className="eyebrow">Lastly...</p>
          <h2 id="final-moment-title">I really want to do this right now 🥺</h2>
          <img
            className="final-kiss-gif"
            src="/bubu-dudu-kiss.gif"
            alt="A cartoon panda and bear sharing a sweet kiss"
          />
        </RevealSection>

        <div className="signature">Forever yours,</div>
      </section>
    </main>
  )
}

export default App
