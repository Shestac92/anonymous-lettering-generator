// import React from 'react';
import { useState } from 'react';
import './App.css';


function App() {
  const [prompt, setPrompt] = useState('');
  const [img, setImg] = useState('');
  const [lineSpacingFactor, setLineSpacingFactor] = useState(20);
  const [letterSpacingFactor, setLetterSpacingFactor] = useState(20);
  const [positionRandomOffsetFactor, setPositionRandomOffsetFactor] = useState(20);
  const [rotationRandomDegreeFactor, setRotationRandomDegreeFactor] = useState(20);
  const [sizeRandomFactor, setSizeRandomFactor] = useState(20);



  async function handleClick() {
    if (!prompt) {
      return;
    }

    const rawRes = await fetch("http://localhost:3001/api/generate", {
      method: "POST",
      body: JSON.stringify({
        // prompt: "аклмно аааа кккк лллл мммм ннннн ооооо",
        prompt: prompt,
        lang: "ru",
        lineSpacingFactor: lineSpacingFactor / 100,
        letterSpacingFactor: letterSpacingFactor / 100,
        positionRandomOffsetFactor: positionRandomOffsetFactor / 100,
        rotationRandomDegreeFactor: rotationRandomDegreeFactor / 100,
        sizeRandomFactor: sizeRandomFactor / 100,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    const res = await rawRes.text();

    setImg(`data:image/png;base64,${res}`);
  }

  return (
    <div className="App">

      <div className="container">
        <header>
          <img src="https://via.placeholder.com/150x50.png?text=Logo" alt="Logo" id="logo"></img>
        </header>

        <main>
          <h3>Put away scissors and glue, save your time</h3>

          <p>
            <textarea id="prompt" name="prompt" rows={3} placeholder="Type your anonymous message here..." onChange={(e) => setPrompt(e.target.value)}></textarea>
          </p>

          <details>
            <summary>
              Letter parameters
            </summary>
            <Slider handleSlider={setLineSpacingFactor} factor={lineSpacingFactor} label='Line spacing'></Slider>
            <Slider handleSlider={setLetterSpacingFactor} factor={letterSpacingFactor} label='Letter spacing'></Slider>
            <Slider handleSlider={setPositionRandomOffsetFactor} factor={positionRandomOffsetFactor} label='Position randomizer'></Slider>
            <Slider handleSlider={setRotationRandomDegreeFactor} factor={rotationRandomDegreeFactor} label='Rotation randomizer'></Slider>
            <Slider handleSlider={setSizeRandomFactor} factor={sizeRandomFactor} label='Size randomizer'></Slider>
          </details>

          <details>
            <summary>
              Letter limitations
            </summary>
            <p>
              The letter size limited with 20 chars in a line and 40 lines in total.
            </p>
          </details>

          <button onClick={handleClick}>Generate one</button>
          <div id="responseContainer">
            <img id="responseImage" src={img} alt="Server generated response" style={{ display: "block" }}></img>
          </div>
        </main>
      </div>
      {/* TODO: buy me a coffee - https://help.buymeacoffee.com/en/articles/5885162-how-to-add-a-button-or-a-widget-to-your-website */}
      {/* TODO: error handling */}

      <footer>
        <p>Contact me at <a href="mailto:shestacov92@gmail.com">shestacov92@gmail.com</a></p>
      </footer>
    </div>
  );
}

function Slider({ factor, handleSlider, label }: any) {
  return (
    <div className="slider-wrapper">
      <label className="slider-label" htmlFor={label}>{label}</label>
      <input id={label} type="range" min="0" max="100" value={factor} className="slider" onChange={(e) => handleSlider(e.target.value)}></input>
    </div>
  )
}

export default App;
