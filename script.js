/* LOAD VOICES */
let availableVoices = [];
function loadVoices() {
  availableVoices = speechSynthesis.getVoices();
  const vs = document.getElementById('voiceSelect');
  vs.innerHTML = '<option value="default">Default Voice</option>';

  availableVoices.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = v.name + " (" + v.lang + ")";
    vs.appendChild(opt);
  });
}
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

/* CONTROLS */
let textInput = document.getElementById("textInput");
let rateValue = 1;

document.querySelectorAll(".speedBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    rateValue = parseFloat(btn.dataset.rate);
    document.getElementById("rateLabel").textContent = rateValue.toFixed(1);
  });
});

document.getElementById("pitchControl").addEventListener("input", e => {
  document.getElementById("pitchLabel").textContent = e.target.value;
});

document.getElementById("clearBtn").addEventListener("click", () => {
  textInput.value = "";
});

/* CHUNK LOGIC */
function splitToChunks(text, max = 240) {
  const sentences = text.replace(/\n+/g, '. ').split(/(?<=[.?!])\s+/);
  let chunks = [];
  let cur = "";

  for (const s of sentences) {
    if ((cur + " " + s).trim().length <= max) cur = (cur + " " + s).trim();
    else {
      if (cur) chunks.push(cur);
      if (s.length <= max) cur = s;
      else {
        for (let i = 0; i < s.length; i += max) chunks.push(s.slice(i, i + max));
        cur = "";
      }
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

/* SPEAK FUNCTION */
let utterances = [];
let currentIndex = 0;

function speakAll(text) {
  speechSynthesis.cancel();
  const chunks = splitToChunks(text);

  utterances = chunks.map(chunk => {
    let u = new SpeechSynthesisUtterance(chunk);

    let selected = document.getElementById("voiceSelect").value;
    if (selected !== "default") u.voice = availableVoices[selected];

    u.rate = rateValue;
    u.pitch = parseFloat(pitchControl.value);

    u.onend = () => {
      currentIndex++;
      if (currentIndex < utterances.length) {
        speechSynthesis.speak(utterances[currentIndex]);
      }
    };

    return u;
  });

  currentIndex = 0;
  if (utterances.length) speechSynthesis.speak(utterances[0]);
}

/* BUTTON EVENTS */
playBtn.addEventListener("click", () => {
  let text = textInput.value.trim();
  if (!text) { alert("Please paste text first."); return; }
  speakAll(text);
});

pauseBtn.addEventListener("click", () => speechSynthesis.pause());
resumeBtn.addEventListener("click", () => speechSynthesis.resume());
cancelBtn.addEventListener("click", () => speechSynthesis.cancel());

previewBtn.addEventListener("click", () => {
  let u = new SpeechSynthesisUtterance("This is a voice preview.");
  let selected = document.getElementById("voiceSelect").value;
  if (selected !== "default") u.voice = availableVoices[selected];
  u.rate = rateValue;
  u.pitch = parseFloat(pitchControl.value);
  speechSynthesis.speak(u);
}); 
