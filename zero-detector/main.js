const res = []

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

// plotGraph({
//   signals: [
//     getZeros(SAMPLE).reverse()
//   ],
//   context: document.querySelector('canvas').getContext('2d'),
//   suggestedMin: -1,
//   suggestedMax: 1,
//   colors: ['orange', 'white', 'yellow']
// })
