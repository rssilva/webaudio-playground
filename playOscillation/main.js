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

function createSignal (freq, audioContext) {
  const signal = []
  let t
  const period = 1 / freq * (audioContext.sampleRate)

  for (let i = 0; i < period; i++) {
    t = i / audioContext.sampleRate

    const value1 = Math.sin(6.28 * freq * t)
    signal.push(value1)
  }

  return signal
}

function connectNodes (stream) {
  oscilloscope = new Oscilloscope({ audioContext, canvasContext: document.querySelector('canvas').getContext('2d') })
  const audioInput = audioContext.createMediaStreamSource(stream)
  const oscillator = audioContext.createOscillator()
  oscillator.frequency.value = 350
  // oscillator.
  oscillator.start()

  // oscillator.connect(audioContext.destination)

  const processor = audioContext.createScriptProcessor(256, 2, 1)
  // const signal = createSignal(audioContext.sampleRate / 256 * 2, audioContext)
  const signal = createSignal(50, audioContext)

  let counter = 0

  processor.onaudioprocess = (ev) => {
    const inputData = ev.inputBuffer.getChannelData(0)
    const outputData = ev.outputBuffer.getChannelData(0)

    const length = inputData.length

    for (let sample = 0; sample < length; sample++) {
      if (signal[counter] !== undefined) {
        outputData[sample] = signal[counter]
        counter++
      } else {
        // outputData[sample] = signal[counter - 1]
        // outputData[sample] = (signal[counter - 1] + signal[0]) / 2
        outputData[sample] = signal[0]
        counter = 0
      }
    }
  }

  oscilloscope.setInputs([
    // oscillator,
    processor
  ])

  oscilloscope.start()
}

document.querySelector('.pey').addEventListener('click', () => {
  start()
  document.querySelector('.pey').style.display = 'none'
})
