// Read phrases out loud with the browser's built-in voices (Web Speech API).
// Most devices have a Korean voice. Mongolian voices are rare, so we check first.

let voices = [];

function refreshVoices() {
  if ("speechSynthesis" in window) voices = window.speechSynthesis.getVoices();
}

if ("speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

export function canSpeak(lang) {
  if (!("speechSynthesis" in window)) return false;
  if (lang === "ko") return true; // let the browser pick; Korean is almost always there
  return voices.some((voice) => voice.lang.toLowerCase().startsWith(lang));
}

export function speak(text, lang) {
  if (!("speechSynthesis" in window)) return false;
  const code = lang === "ko" ? "ko-KR" : "mn-MN";
  const utterance = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
  utterance.lang = code;
  utterance.rate = 0.85;
  const voice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
