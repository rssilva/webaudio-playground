class Oscilloscope {
  constructor ({ audioContext, canvasContext, isDrawing = false }) {
    this.bufferSize = 256
    this.sampleSize = this.bufferSize

    this.inputs = []
    this.inputData = []
    this.recorders = []

    this.audioContext = audioContext
    this.canvasContext = canvasContext

    this.width = canvasContext.canvas.width
    this.height = canvasContext.canvas.height

    this.isDrawing = isDrawing
    this.plotBegin = 0

    this.colors = [
      'rgba(255, 255, 255, 1)',
      'rgb(255, 255, 0)',
      'rgb(255, 0, 0)'
    ]

    this.recorded = []

    this.bindEvents()
  }

  setInputs (inputs = []) {
    this.inputs = inputs

    this.recorded = inputs.map(input => [])
  }

  start () {
    this.recorders = this.inputs.map((node, index) => {
      const processor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1)
      processor.connect(this.audioContext.destination)

      node.connect(processor)

      processor.onaudioprocess = (ev) => {
        const inputData = ev.inputBuffer.getChannelData(0)
        const outputData = ev.outputBuffer.getChannelData(0)

        const length = inputData.length

        for (let sample = 0; sample < length; sample++) {
          outputData[sample] = inputData[sample]

          if (this.isRecording) {
            this.recorded[index].push(inputData[sample])
          }
        }

        this.inputData[index] = inputData
      }

      return processor
    })
  }

  draw () {
    setTimeout(() => {
      this.draw()
    }, 50)

    if (!this.isDrawing) {
      return
    }

    this.setDraw()

    this.inputData.map((data, index) => {
      this.drawData(data, index)
    })
  }

  drawRecorded () {
    this.setDraw()

    this.recorded.map((data, index) => {
      const slice = data.slice(this.plotBegin, this.plotBegin + this.sampleSize)
      this.drawData(slice, index)
    })
  }

  setDraw () {
    this.canvasContext.fillStyle = 'rgb(0, 0, 0)'
    this.canvasContext.fillRect(0, 0, this.width, this.height)
  }

  drawData (data, index) {
    this.canvasContext.lineWidth = 1
    this.canvasContext.strokeStyle = this.colors[index]
    this.canvasContext.beginPath()

    const sliceWidth = this.width * 1.0 / this.sampleSize
    let x = 0

    for (let i = 0; i < data.length; i++) {
      const v = this.height / 4
      const y = v * data[i] + this.height / 2

      if (i === 0) {
        this.canvasContext.moveTo(x, y)
      } else {
        this.canvasContext.lineTo(x, y)
      }

      x += sliceWidth
    }

    this.canvasContext.lineTo(this.canvasContext.width, this.canvasContext.height / 2)
    this.canvasContext.stroke()
  }

  startRecording () {
    this.isRecording = true
  }

  stopRecording () {
    this.isRecording = false
  }

  bindEvents () {
    const toggle = document.querySelector('.toggle-draw')
    const startRec = document.querySelector('.start-rec')
    const stopRec = document.querySelector('.stop-rec')
    const drawRec = document.querySelector('.draw-rec')
    const windowSize = document.querySelector('.window-size-range')
    const position = document.querySelector('.position-range')

    if (toggle) {
      toggle.addEventListener('click', () => {
        this.isDrawing = !this.isDrawing

        if (this.isDrawing) {
          this.draw()
        }
      })
    }

    if (startRec && stopRec) {
      startRec.addEventListener('click', () => { this.isRecording = true })

      stopRec.addEventListener('click', () => {
        position.max = this.recorded[0].length - this.sampleSize
        this.isRecording = false
      })
    }

    if (drawRec) {
      drawRec.addEventListener('click', () => this.drawRecorded())
    }

    if (windowSize) {
      windowSize.min = 1
      windowSize.max = 200

      windowSize.addEventListener('change', (ev) => {
        this.sampleSize = this.recorded[0].length / ev.target.value

        position.max = this.recorded[0].length - this.sampleSize

        this.drawRecorded()
      })
    }

    if (position) {
      position.min = 0

      position.addEventListener('input', (ev) => {
        this.plotBegin = ev.target.value
        this.drawRecorded()
      })
    }
  }
}
