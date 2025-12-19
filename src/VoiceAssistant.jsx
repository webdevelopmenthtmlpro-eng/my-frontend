import React, { useState, useRef, useEffect } from "react";

function VoiceAssistant({ onSendMessage, userId }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionError, setRecognitionError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const vocabRef = useRef(new Set());
  const [voiceList, setVoiceList] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(null);
  const [forceFemale, setForceFemale] = useState(false);
  const [cloudTtsEnabled, setCloudTtsEnabled] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setRecognitionError("");
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const trans = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += trans + " ";
        } else {
          interim += trans;
        }
      }

      const raw = (final || interim).trim();
      if (final) {
        const corrected = normalizeTranscript(raw);
        setTranscript(corrected);
        (async () => {
          try {
            const lt = await correctWithLanguageTool(corrected);
            if (lt && lt !== corrected) setTranscript(lt);
          } catch (e) {
            // ignore LT failures
          }
        })();
      } else {
        setTranscript(raw);
      }
    };

    recognition.onerror = (event) => {
      setRecognitionError(`Error: ${event.error}`);
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // load available speechSynthesis voices and pick a female default
  useEffect(() => {
    const loadVoices = () => {
      const voices = (synthRef.current && synthRef.current.getVoices && synthRef.current.getVoices()) || [];
      setVoiceList(voices);
      if (!selectedVoiceName && voices.length) {
        const preferredNames = [
          'female', 'woman', 'zira', 'samantha', 'victoria', 'amelia', 'alloy',
          'google', 'microsoft'
        ];
        const found = voices.find((voice) => {
          const n = (voice.name || '').toLowerCase();
          const l = (voice.lang || '').toLowerCase();
          return preferredNames.some((pn) => n.includes(pn) || l.includes(pn));
        });
        if (found) setSelectedVoiceName(found.name);
        else setSelectedVoiceName(voices[0].name);
      }
    };

    loadVoices();
    // some browsers fire voiceschanged
    window.speechSynthesis && window.speechSynthesis.addEventListener && window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis && window.speechSynthesis.removeEventListener && window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoiceName]);

  // build vocabulary from English translations (if available) to help typo correction
  useEffect(() => {
    try {
      const en = (window.translations && window.translations.en) || {};
      Object.values(en).forEach((val) => {
        if (!val || typeof val !== 'string') return;
        val
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
          .split(/\s+/)
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean)
          .forEach((w) => vocabRef.current.add(w));
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Handle Enter key to send voice transcript
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && voiceEnabled && transcript && !isProcessing && !recognitionError) {
        e.preventDefault();
        handleSendVoiceMessage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceEnabled, transcript, isProcessing, recognitionError]);

  // Levenshtein distance for simple fuzzy correction
  const levenshtein = (a, b) => {
    a = a || '';
    b = b || '';
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  };

  const findClosestWord = (word) => {
    if (!word) return word;
    const w = word.toLowerCase();
    if (vocabRef.current.has(w)) return word;
    let best = null;
    let bestDist = Infinity;
    vocabRef.current.forEach((v) => {
      if (Math.abs(v.length - w.length) > 3) return;
      const d = levenshtein(w, v);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    });
    if (best && bestDist <= Math.max(1, Math.floor(w.length * 0.33))) {
      return best;
    }
    return word;
  };

  const normalizeTranscript = (text) => {
    if (!text) return text;
    return text
      .split(/\s+/)
      .map((w) => {
        const m = w.match(/^([\w']+)([^\w']*)$/);
        if (!m) return w;
        const core = m[1];
        const suffix = m[2] || '';
        const corrected = findClosestWord(core);
        return corrected + suffix;
      })
      .join(' ');
  };

  // Use LanguageTool public API for stronger, context-aware corrections (best-effort)
  const correctWithLanguageTool = async (text) => {
    if (!text || typeof fetch !== 'function') return text;
    try {
      const form = new URLSearchParams();
      form.append('text', text);
      form.append('language', 'en-US');

      const res = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });

      if (!res.ok) return text;
      const data = await res.json();
      if (!data.matches || data.matches.length === 0) return text;

      // apply corrections from end -> start to preserve offsets
      let corrected = text;
      const matches = data.matches.slice().sort((a, b) => b.offset - a.offset);
      matches.forEach((m) => {
        if (!m.replacements || m.replacements.length === 0) return;
        const replacement = m.replacements[0].value;
        const start = m.offset;
        const end = m.offset + m.length;
        corrected = corrected.slice(0, start) + replacement + corrected.slice(end);
      });
      return corrected;
    } catch (err) {
      return text;
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setRecognitionError("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = async (text) => {
    // If cloud TTS enabled, try backend proxy first
    if (cloudTtsEnabled) {
      try {
        setIsSpeaking(true);
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          const audioBase64 = data.audioBase64 || data.audio;
          const contentType = data.contentType || 'audio/mpeg';
          if (audioBase64) {
            const audio = new Audio(`data:${contentType};base64,${audioBase64}`);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
            return;
          }
        }
        // fallthrough to local TTS on failure
      } catch (err) {
        console.warn('Cloud TTS failed, falling back to local TTS', err);
        // continue to local TTS
      }
    }

    if (!synthRef.current) return;

    synthRef.current.cancel();

    let voices = synthRef.current.getVoices() || [];
    if (!voices.length) {
      // some browsers populate voices asynchronously; try again briefly
      voices = synthRef.current.getVoices() || [];
    }

    const preferredNames = [
      'female', 'woman', 'zira', 'samantha', 'victoria', 'amelia', 'alloy',
      'google uk english female', 'google us english', 'microsoft zira'
    ];

    // prefer user-selected voice if available
    let femaleVoice = null;
    if (selectedVoiceName) {
      femaleVoice = voices.find((v) => v.name === selectedVoiceName) || null;
    }
    if (!femaleVoice) {
      femaleVoice =
        voices.find((voice) => {
          const n = (voice.name || '').toLowerCase();
          const l = (voice.lang || '').toLowerCase();
          return (
            preferredNames.some((pn) => n.includes(pn) || l.includes(pn)) ||
            n.includes('female')
          );
        }) || voices.find((v) => v.lang && v.lang.startsWith('en')) || voices[0];
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let sentenceIndex = 0;

    const speakNextSentence = () => {
      if (sentenceIndex >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const sentence = sentences[sentenceIndex].trim();
      sentenceIndex++;

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 0.85;
      utterance.pitch = 1.1 + Math.random() * 0.2;
      utterance.volume = 0.85;

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        if (sentenceIndex < sentences.length) {
          setTimeout(speakNextSentence, 400);
        } else {
          setIsSpeaking(false);
        }
      };
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    };

    setIsSpeaking(true);
    speakNextSentence();
  };

  const handleSendVoiceMessage = async () => {
    if (!transcript.trim()) return;

    const voiceMessage = transcript.trim();
    setTranscript("");
    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:5000/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: voiceMessage }),
      });

      const data = await response.json();
      const botReply =
        data.reply || "I couldn't understand that. Please try again.";

      onSendMessage(voiceMessage);

      setTimeout(() => {
        speakText(botReply);
      }, 500);
    } catch (error) {
      console.error("Voice message failed:", error);
      const errorMessage =
        "Sorry, I couldn't process your request. Please try again.";
      speakText(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "12px",
        backgroundColor: "#e0f7ff",
        borderRadius: "6px",
        border: "2px solid #06b6d4",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title={voiceEnabled ? "Voice ON" : "Voice OFF"}
          style={{
            padding: "8px 12px",
            background: voiceEnabled ? "#10b981" : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {voiceEnabled ? "🔊 ON" : "🔇 OFF"}
        </button>

        {voiceEnabled && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            style={{
              padding: "8px 12px",
              background: isListening ? "#ef4444" : "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: isProcessing ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
            title={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? "🛑" : "🎤"} {isListening ? "Stop" : "Speak"}
          </button>
        )}

        {isSpeaking && (
          <button
            onClick={() => synthRef.current?.cancel()}
            style={{
              padding: "8px 12px",
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
            title="Stop speaking"
          >
            🔇 Stop
          </button>
        )}

        {voiceEnabled && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#0f172a' }}>Voice:</label>
            <select
              value={selectedVoiceName || ''}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: 6 }}
            >
              {voiceList.length === 0 && <option>Loading voices...</option>}
              {(() => {
                const preferredNames = [
                  'female', 'woman', 'zira', 'samantha', 'victoria', 'amelia', 'alloy', 'google', 'microsoft'
                ];
                const femaleCandidates = voiceList.filter(v => {
                  const n = (v.name||'').toLowerCase();
                  const l = (v.lang||'').toLowerCase();
                  return preferredNames.some(pn => n.includes(pn) || l.includes(pn));
                });
                const other = voiceList.filter(v => !femaleCandidates.includes(v));
                return (
                  <>
                    {femaleCandidates.length > 0 && (
                      <optgroup label="Female voices">
                        {femaleCandidates.map(v => (
                          <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                        ))}
                      </optgroup>
                    )}
                    {other.length > 0 && (
                      <optgroup label="Other voices">
                        {other.map(v => (
                          <option key={v.name} value={v.name} disabled={forceFemale}>{v.name} ({v.lang})</option>
                        ))}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>

            <button
              onClick={() => {
                const preferredNames = ['female','woman','zira','samantha','victoria','amelia','alloy','google','microsoft'];
                const femaleCandidates = voiceList.filter(v => {
                  const n = (v.name||'').toLowerCase();
                  const l = (v.lang||'').toLowerCase();
                  return preferredNames.some(pn => n.includes(pn) || l.includes(pn));
                });
                if (femaleCandidates.length) {
                  setSelectedVoiceName(femaleCandidates[0].name);
                  setForceFemale(true);
                } else if (voiceList.length) {
                  setSelectedVoiceName(voiceList[0].name);
                  setForceFemale(true);
                }
              }}
              style={{ padding: '6px 8px', borderRadius: 6 }}
              title="Force female voice"
            >Force female</button>
            {forceFemale && (
              <button onClick={() => setForceFemale(false)} style={{ padding: '6px 8px', borderRadius: 6 }}>Unlock</button>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }} title="Use cloud TTS (more natural voices)">
              <input type="checkbox" checked={cloudTtsEnabled} onChange={(e) => setCloudTtsEnabled(e.target.checked)} />
              <span style={{ fontSize: 12 }}>Use cloud TTS</span>
            </label>
          </div>
        )}
      </div>

      {voiceEnabled && transcript && !isProcessing && (
        <div
          style={{
            padding: "8px",
            background: "#dbeafe",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#1e40af",
            borderLeft: "3px solid #3b82f6",
          }}
        >
          <strong>You:</strong> {transcript}
        </div>
      )}

      {voiceEnabled && recognitionError && (
        <div
          style={{
            padding: "8px",
            background: "#fee2e2",
            borderRadius: "4px",
            fontSize: "10px",
            color: "#991b1b",
            borderLeft: "3px solid #ef4444",
          }}
        >
          {recognitionError}
        </div>
      )}

      {voiceEnabled && isProcessing && (
        <div
          style={{
            padding: "8px",
            background: "#fef3c7",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#92400e",
          }}
        >
          ⏳ Processing...
        </div>
      )}

      {voiceEnabled && transcript && !recognitionError && !isProcessing && (
        <button
          onClick={handleSendVoiceMessage}
          style={{
            padding: "8px 12px",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            width: "100%",
          }}
        >
          ✓ Send Voice Message
        </button>
      )}
    </div>
  );
}

export default VoiceAssistant;
