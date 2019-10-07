let audioContext

function getUserMedia (cb) {
  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({ audio: true }, cb, (e) => console.error('error', e))
  }
}

function start () {
  audioContext = new AudioContext()

  getUserMedia((stream) => {
    audioContext.resume().then(() => {
      connectNodes(stream)
    })
  })
}

function getOscillation (signal) {
  const initial = signal[signal.length - 1]
  let amp = initial

  let lastSignal = getSignal(amp)
  let currentSignal = lastSignal

  function getSignal (value) {
    return value < 0 ? -1 : 1
  }

  const transitions = []
  const recorded = []

  for (let i = signal.length - 2; i > 0; i--) {
    amp = signal[i]

    currentSignal = getSignal(amp)

    if (currentSignal != lastSignal) {
      transitions.push(i)

      lastSignal = currentSignal
    }

    if (transitions.length >= 1 && transitions.length < 3) {
      recorded.push(amp)
    }
  }

  return recorded
}

const GLOBAL = {}

function connectNodes (stream) {
  const oscilloscope = new Oscilloscope({ audioContext, canvasContext: document.querySelector('canvas').getContext('2d') })
  // const audioInput = audioContext.createMediaStreamSource(stream)

  const gain = audioContext.createGain()
  gain.gain.setValueAtTime(1, audioContext.currentTime)
  // gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 20)

  const osc1 = audioContext.createOscillator()
  osc1.frequency.value = 350
  osc1.type = 'sin'
  osc1.start()

  const osc2 = audioContext.createOscillator()
  osc2.frequency.value = 10
  osc2.start()

  osc1.connect(gain)
  osc2.connect(gain.gain)

  oscilloscope.setInputs([
    // osc1,
    // osc2,
    gain
  ])

  oscilloscope.start()
  // oscilloscope.draw()
  GLOBAL.gain = gain
  GLOBAL.osc1 = osc1
}

document.querySelector('.pey').addEventListener('click', () => {
  start()
  document.querySelector('.pey').style.display = 'none'
})
