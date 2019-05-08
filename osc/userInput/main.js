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

let oscilloscope

function connectNodes (stream) {
  oscilloscope = new Oscilloscope({ audioContext, canvasContext: document.querySelector('canvas').getContext('2d') })
  const audioInput = audioContext.createMediaStreamSource(stream)

  const delay = audioContext.createDelay(5)
  delay.delayTime.setValueAtTime(1 / 220, audioContext.currentTime)

  audioInput.connect(delay)

  oscilloscope.setInputs([
    audioInput,
    delay
  ])

  oscilloscope.start()
  // oscilloscope.draw()
}

document.querySelector('.pey').addEventListener('click', () => {
  start()
  document.querySelector('.pey').style.display = 'none'
})
