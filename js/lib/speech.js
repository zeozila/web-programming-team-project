// Read phrases out loud with the browser's built-in voices (Web Speech API).
// The browser can only use voices installed on the device (Chrome and Edge also add
// online voices). If there's no Korean or Mongolian voice, we say so instead of
// staying silent.

const supported = "speechSynthesis" in window;
let voices = [];

function refreshVoices() {
  voices = window.speechSynthesis.getVoices();
}

// Voices load in the background, so wait for them (at most 2 seconds)
const voicesReady = new Promise((resolve) => {
  if (!supported) return resolve();
  refreshVoices();
  if (voices.length) return resolve();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    refreshVoices();
    resolve();
  });
  setTimeout(() => {
    refreshVoices();
    resolve();
  }, 2000);
});

function findVoice(lang) {
  const matches = voices.filter((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith(lang));
  // prefer the more natural online voices when there are several
  return matches.find((voice) => !voice.localService) || matches[0];
}

let current = null; // keep a reference, otherwise Chrome can drop the sentence

/**
 * Speak a phrase. Returns "ok", "no-voice" (nothing installed for that language)
 * or "unsupported" (the browser has no speech at all).
 */
export async function speak(text, lang) {
  if (!supported) return "unsupported";
  await voicesReady;
  const voice = findVoice(lang);
  if (!voice) return "no-voice";

  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();

  current = new SpeechSynthesisUtterance(text.replace(/…/g, "").trim());
  current.voice = voice;
  current.lang = voice.lang;
  current.rate = 0.85;

  // speaking right after cancel() is sometimes ignored in Chrome, so wait a moment
  setTimeout(() => {
    synth.resume();
    synth.speak(current);
  }, 80);
  return "ok";
}
