import { useEffect, useState } from 'react';
import './App.css';
import Lottie from 'react-lottie';


function App() {
  const isDev = process.env.NODE_ENV === 'development';
  const API_URL = isDev ? 'http://localhost:3001/api/generate' : '/api/generate';

  const [prompt, setPrompt] = useState('');
  const [img, setImg] = useState('');
  const [display, setDisplay] = useState('none');
  const [transparent, setTransparent] = useState(false);
  const [lineSpacingFactor, setLineSpacingFactor] = useState(20);
  const [letterSpacingFactor, setLetterSpacingFactor] = useState(20);
  const [positionRandomOffsetFactor, setPositionRandomOffsetFactor] = useState(20);
  const [rotationRandomDegreeFactor, setRotationRandomDegreeFactor] = useState(20);
  const [sizeRandomFactor, setSizeRandomFactor] = useState(40);
  const [animationData, setAnimationData] = useState();

  const animationOpts = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  useEffect(() => {
    fetch(`/logo-animation.json`)
      .then(res => res.json())
      .then(json => setAnimationData(json));
  }, [])

  async function handleClick() {
    if (!prompt) {
      return;
    }

    const rawRes = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        prompt,
        transparent,
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

    if (rawRes.ok) {
      const res = await rawRes.text();
      setImg(`data:image/png;base64,${res}`);
      setDisplay('block');
    } else {
      const res = await rawRes.json();
      alert(res.message);
    }
  }

  return (
    <div className="App">
      <div className="container">
        <header>
          <Lottie
            options={animationOpts}
            isClickToPauseDisabled={true}
            style={{maxWidth: '600px'}}
          />
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
            <Checkbox handleCheckbox={setTransparent} flag={transparent} label='Transparent background'></Checkbox>
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
            <p id="limitations">
              The letter size is limited to 20 characters per line and 40 lines in total. With maximum spacing it provides
              image size about 1180x5120 px.
              Only PNG is supported as the output format to enable a transparent background if needed.
              For support of new languages and symbols, feel free to start a PR with the required assets.
              For details on PRs, check <a href="https://github.com/Shestac92/anonymous-lettering-generator/blob/main/README.md#policy-for-pr-suggestions">the repository README</a>.
            </p>
          </details>

          <button onClick={handleClick}>Generate one</button>
          <a download="anon-letter.png" href={img} style={{ display: display, marginBottom: 10, paddingTop: 10 }}>
            <button>Download</button>
          </a>

          <div id="responseContainer">
            <img id="responseImage" src={img} alt="Server generated response" style={{ display: display }}></img>
          </div>
        </main>
      </div>

      <footer>
        <p>Feel free to open a PR or fork it! <a href="https://github.com/Shestac92/anonymous-lettering-generator">Git repository</a>
        </p>
        <a href="https://buymeacoffee.com/shestac92" target="_blank">
            <img height="50px" alt="buy me a coffee" src="/buy-me-a-coffee.png"></img>
          </a>
      </footer>
    </div>
  );
}

function Slider({ factor, handleSlider, label }: any) {
  return (
    <div className="control-wrapper">
      <label className="control-label" htmlFor={label}>{label}</label>
      <input id={label} type="range" min="0" max="100" value={factor} className="slider" onChange={(e) => handleSlider(e.target.value)}></input>
    </div>
  )
}

function Checkbox({ flag, handleCheckbox, label }: any) {
  return (
    <div className="control-wrapper">
      <label className="control-label" htmlFor={label}>{label}</label>
      <input id={label} type="checkbox" value={flag} className="checkbox" onChange={(e) => handleCheckbox(e.target.checked)}></input>
    </div>
  )
}

export default App;
