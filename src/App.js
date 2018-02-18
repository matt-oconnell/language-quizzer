import React, { Component } from 'react'
import logo from './logo.png'
import './App.css'

const jsdiff = require('diff')


const questions = [
  [
    'every year in april i must pay taxes (impuestos) to the IRS',
    'cada año en abríl debo impuestos al IRS'
  ],
  [
    'do you want to buy a house in brooklyn?',
    'quieres comprar una casa en brooklyn'
  ],
  [
    'were you able to explain the plan to her',
    'puedes explicar el plan a ella'
  ],
  [
    'i needed to call my mom but i couldn\'t',
    'necesité llamar a mi madre pero no pude'
  ]
]

class App extends Component {
  constructor(props) {
    super(props)
    this._configureRecognition()
    this.state = {
      recognizing: false,
      transcript: '',
      diff: '',
      questionIndex: 0,
      answer: '',
      question: '',
      submitted: false
    }
  }

  componentWillMount() {
    this.setState({
      question: questions[0][0],
      answer: questions[0][1]
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Audio Differ</h1>
        </header>
        <div onClick={this._handleClick} className="socket">
          <div className={`button ${this.state.recognizing ? 'active': ''}`}></div>
        </div>
        <button onClick={this._clear}>Clear</button>
        <button onClick={this._next}>Next</button>
        <p><strong>{this.state.question}</strong></p>
        <p>Your transcript: { this.state.transcript ? this.state.transcript : '...' }</p>
        { this.state.submitted &&
          <div>
            <p>Correct answer: { this.state.answer }</p>
            <pre className='diff-result'>
              {this.state.diff}
            </pre>
          </div>
        }
      </div>
    )
  }

  _handleClick = () => {
    const hasStarted = this.state.recognizing
    if (hasStarted) {
      this.recognition.stop()
      this.setState({
        submitted: true
      })
    }
    else {
      this.recognition.start()
    }
    this.setState({
      recognizing: !hasStarted,
    })
  }

  _clear = () => {
    this.setState({ transcript: '', diff: '', submitted: false })
  }

  _next = () => {
    this._clear();
    const newIndex = this.state.questionIndex + 1
    this.setState({
      questionIndex: newIndex,
      answer: questions[newIndex][1],
      question: questions[newIndex][0],
    })
  }

  _configureRecognition = () => {
    this.recognition = new window.webkitSpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'es-NI'
    this.start_timestamp = ''
    
    this.recognition.onstart = () => this.setState({ recognizing: true })
    
    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        console.log('info_no_speech')
      }
      if (event.error === 'audio-capture') {
        console.log('info_no_microphone')
      }
      if (event.error === 'not-allowed') {
        if (event.timeStamp - this.start_timestamp < 100) {
          console.log('info_blocked')
        } else {
          console.log('info_denied')
        }
      }
    }

    this.recognition.onend = () => {
      console.log('on end')
      this.setState({ recognizing: false })
    }

    this.recognition.onresult = (event) => {
      var interim_transcript = ''
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.setState({ transcript: this.state.transcript + event.results[i][0].transcript })
        } else {
          console.log('not final')
          interim_transcript += event.results[i][0].transcript
        }
      }
      this.setState({
        diff: this._diffTranscript(this.state.transcript)
      })
    }
  }

  _diffTranscript(newTranscript, comparison = this.state.answer) {
    return jsdiff.diffChars(newTranscript.toLowerCase(), comparison.toLowerCase()).map(function(part, index) {
      var spanStyle = {
        backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : ''
      };
      return <span key={index} style={spanStyle}>{part.value}</span>
    });
  }
}

export default App
