import { useEffect, useRef, useState } from "react";
import DictionaryPage from "./DictionaryPage.jsx";
import SentenceBuilder from "./SentenceBuilder.jsx";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");
const LEVELS = [
  { id: "beginner", label: "Cơ bản", number: "01" },
  { id: "intermediate", label: "Trung bình", number: "02" },
  { id: "advanced", label: "Nâng cao", number: "03" },
];

const levelNames = {
  beginner: "Cơ bản",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

function App() {
  const [dictionaryPage, setDictionaryPage] = useState(window.location.pathname === "/dictionary");
  const [level, setLevel] = useState("beginner");
  const [lessons, setLessons] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeConversation, setActiveConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [conversationInput, setConversationInput] = useState("");
  const [conversationFeedback, setConversationFeedback] = useState("");
  const [conversationTurn, setConversationTurn] = useState(0);
  const [conversationFinished, setConversationFinished] = useState(false);
  const [conversationBusy, setConversationBusy] = useState(false);
  const [conversationListening, setConversationListening] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const conversationRecognitionRef = useRef(null);

  useEffect(() => {
    const handleNavigation = () => setDictionaryPage(window.location.pathname === "/dictionary");
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    setDictionaryPage(window.location.pathname === "/dictionary");
  }

  useEffect(() => {
    if (dictionaryPage) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`${API_URL}/api/lessons?level=${level}`),
      fetch(`${API_URL}/api/conversations?level=${level}`),
    ])
      .then(async ([lessonResponse, conversationResponse]) => {
        if (!lessonResponse.ok || !conversationResponse.ok) {
          throw new Error("Không thể tải bài luyện tập.");
        }
        return Promise.all([lessonResponse.json(), conversationResponse.json()]);
      })
      .then(([lessonData, conversationData]) => {
        if (!active) return;
        setLessons(lessonData);
        setSelectedLesson((current) => lessonData.find((item) => item.id === current?.id) || lessonData[0] || null);
        setConversations(conversationData);
        setSelectedConversation((current) => conversationData.find((item) => item.id === current?.id) || conversationData[0] || null);
        setActiveConversation(false);
        setConversationMessages([]);
        setConversationTurn(0);
        setConversationFinished(false);
      })
      .catch(() => active && setError("Không kết nối được backend. Hãy thử tải lại trang hoặc kiểm tra API deployment."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [level, dictionaryPage]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    conversationRecognitionRef.current?.stop();
  }, []);

  function chooseLesson(lesson) {
    setSelectedLesson(lesson);
    setTranscript("");
    setResult(null);
    setError("");
  }

  function toggleMicrophone() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập câu trả lời bên dưới.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    const baseTranscript = transcript.trim();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const part = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += `${part} `;
        else interimText += part;
      }
      setTranscript([baseTranscript, finalText.trim(), interimText.trim()].filter(Boolean).join(" "));
    };
    recognition.onerror = () => {
      setListening(false);
      setError("Không nhận được giọng nói. Hãy cấp quyền micro hoặc nhập câu trả lời.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError("");
    setListening(true);
    recognition.start();
  }

  function speakPrompt() {
    if (!selectedLesson || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedLesson.prompt);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function startConversation() {
    if (!selectedConversation) return;
    setError("");
    setConversationBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/start`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Không thể bắt đầu hội thoại.");
      setSelectedConversation(data.scenario);
      setConversationMessages([{ role: "partner", text: data.partner_message }]);
      setConversationInput("");
      setConversationFeedback("");
      setConversationTurn(0);
      setConversationFinished(false);
      setActiveConversation(true);
    } catch (requestError) {
      setError(requestError.message || "Không kết nối được backend.");
    } finally {
      setConversationBusy(false);
    }
  }

  async function sendConversationReply(event) {
    event.preventDefault();
    const message = conversationInput.trim();
    if (!selectedConversation || !message || conversationBusy || conversationFinished) return;
    setError("");
    setConversationBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turn_index: conversationTurn, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Không gửi được câu trả lời.");
      setConversationMessages((current) => [
        ...current,
        { role: "you", text: message },
        { role: "partner", text: data.next_question ? `${data.partner_reply} ${data.next_question}` : data.partner_reply },
      ]);
      setConversationFeedback(`${data.feedback}${data.phrase_to_try ? ` Thử dùng: “${data.phrase_to_try}”` : ""}`);
      setConversationInput("");
      setConversationTurn((current) => current + 1);
      setConversationFinished(data.finished);
    } catch (requestError) {
      setError(requestError.message || "Không kết nối được backend.");
    } finally {
      setConversationBusy(false);
    }
  }

  function toggleConversationMicrophone() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập câu trả lời.");
      return;
    }
    if (conversationListening) {
      conversationRecognitionRef.current?.stop();
      setConversationListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    const baseText = conversationInput.trim();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let completed = "";
      let interim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const part = event.results[index][0].transcript;
        if (event.results[index].isFinal) completed += `${part} `;
        else interim += part;
      }
      setConversationInput([baseText, completed.trim(), interim.trim()].filter(Boolean).join(" "));
    };
    recognition.onerror = () => {
      setConversationListening(false);
      setError("Không nhận được giọng nói. Hãy cấp quyền micro hoặc nhập câu trả lời.");
    };
    recognition.onend = () => setConversationListening(false);
    conversationRecognitionRef.current = recognition;
    setError("");
    setConversationListening(true);
    recognition.start();
  }

  async function submitAnswer(event) {
    event.preventDefault();
    if (!selectedLesson || !transcript.trim()) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: selectedLesson.id, transcript }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Không thể chấm điểm câu trả lời.");
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Không kết nối được backend.");
    }
  }

  if (dictionaryPage) {
    return <DictionaryPage onHome={() => navigateTo("/")} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="LingoUp trang chủ">
          <span className="brand-mark">L</span>
          <span>Lingo<span className="brand-dot">Up.</span></span>
        </a>
        <nav className="top-nav" aria-label="Điều hướng chính">
          <a className="active" href="#practice">Luyện nói</a>
          <a href="#conversations">Hội thoại</a>
          <a href="/dictionary" onClick={(event) => { event.preventDefault(); navigateTo("/dictionary"); }}>Từ điển</a>
          <a href="#sentence-builder">Ghép câu</a>
          <a href="#vocabulary">Từ vựng</a>
          <a href="#progress">Tiến độ</a>
        </nav>
        <button className="profile-button" aria-label="Tài khoản">Q</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> KHÔNG GIAN LUYỆN TẬP CỦA BẠN</div>
            <h1>Nói tự tin hơn.<br /><span>Từng ngày một.</span></h1>
            <p>Luyện nói tiếng Anh theo chủ đề, học từ mới trong ngữ cảnh và nhận góp ý sau mỗi lần thực hành.</p>
            <div className="hero-meta"><span className="meta-icon">✳</span> Chỉ cần 10 phút mỗi ngày <span className="meta-divider" /> Tiến bộ theo nhịp riêng của bạn</div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card"><span className="art-spark">✳</span><span className="art-quote">“</span><span className="art-word">speak<span> up.</span></span><span className="art-caption">YOUR VOICE, YOUR JOURNEY</span></div>
            <span className="art-star star-one">✳</span><span className="art-star star-two">✦</span><span className="art-star star-three">·</span>
          </div>
        </section>

        <section className="practice-layout" id="practice">
          <div className="main-column">
            <div className="section-heading">
              <div><div className="eyebrow">BẮT ĐẦU TỪ ĐÂU?</div><h2>Chọn cấp độ của bạn</h2></div>
              <span className="step-count">01 <span>/ 03</span></span>
            </div>
            <div className="level-grid" role="tablist" aria-label="Cấp độ tiếng Anh">
              {LEVELS.map((item) => (
                <button key={item.id} className={`level-card ${level === item.id ? "selected" : ""}`} onClick={() => setLevel(item.id)} role="tab" aria-selected={level === item.id}>
                  <span className="level-number">{item.number}</span><span className="level-label">{item.label}</span>
                  <span className="level-description">{item.id === "beginner" ? "Làm quen & xây nền tảng" : item.id === "intermediate" ? "Mở rộng & nói tự nhiên" : "Tranh luận & diễn đạt sâu"}</span>
                  <span className="level-arrow">{level === item.id ? "↗" : "→"}</span>
                </button>
              ))}
            </div>

            <div className="lesson-heading">
              <div><div className="eyebrow">ĐƯỢC THIẾT KẾ CHO BẠN</div><h2>Chủ đề luyện nói <span className="lesson-count">{lessons.length.toString().padStart(2, "0")}</span></h2></div>
              <button className="text-button" onClick={() => document.getElementById("lesson-list")?.scrollIntoView({ behavior: "smooth" })}>Khám phá <span>↘</span></button>
            </div>
            {error && <div className="notice" role="alert">{error}</div>}
            {loading ? <div className="loading">Đang tải chủ đề<span>...</span></div> : (
              <div className="lesson-grid" id="lesson-list">
                {lessons.map((lesson, index) => (
                  <button key={lesson.id} className={`lesson-card ${selectedLesson?.id === lesson.id ? "chosen" : ""}`} onClick={() => chooseLesson(lesson)}>
                    <span className={`lesson-art lesson-art-${index % 3}`}><span>{["◒", "✳", "↗"][index % 3]}</span><small>{levelNames[lesson.level]}</small></span>
                    <span className="lesson-info"><span className="lesson-category">{lesson.category}</span><strong>{lesson.title}</strong><span className="lesson-time">◷ &nbsp;{lesson.duration}</span></span>
                    <span className="card-arrow">↗</span>
                  </button>
                ))}
              </div>
            )}

            <SentenceBuilder />

            <section className="conversation-section" id="conversations">
              <div className="lesson-heading conversation-heading">
                <div><div className="eyebrow">GIAO TIẾP NHƯ NGOÀI ĐỜI</div><h2>Hội thoại tự nhiên <span className="lesson-count">{conversations.length.toString().padStart(2, "0")}</span></h2></div>
                <span className="conversation-tag">ROLE PLAY · ENGLISH</span>
              </div>
              <p className="conversation-intro">Nhập vai trong tình huống thực tế, trả lời theo cách của bạn và tập giữ cuộc trò chuyện tiếp tục.</p>
              <div className="conversation-grid">
                {conversations.map((scenario, index) => (
                  <button
                    key={scenario.id}
                    className={`conversation-card ${selectedConversation?.id === scenario.id ? "chosen" : ""}`}
                    onClick={() => {
                      setSelectedConversation(scenario);
                      setActiveConversation(false);
                      setConversationMessages([]);
                      setConversationTurn(0);
                      setConversationFinished(false);
                    }}
                  >
                    <span className={`conversation-art conversation-art-${index % 3}`} aria-hidden="true">{["☕", "✳", "↗"][index % 3]}</span>
                    <span className="conversation-card-copy"><small>{scenario.category} · {levelNames[scenario.level]}</small><strong>{scenario.title}</strong><span>{scenario.description}</span></span>
                    <span className="card-arrow">↗</span>
                  </button>
                ))}
              </div>
              {selectedConversation && (
                <div className="conversation-room">
                  <div className="room-header">
                    <div className="partner-avatar">{selectedConversation.partner_name[0]}</div>
                    <div><strong>{selectedConversation.partner_name}</strong><span>{selectedConversation.partner_role} · đang luyện cùng bạn</span></div>
                    {!activeConversation ? (
                      <button className="submit-button" onClick={startConversation} disabled={conversationBusy}>{conversationBusy ? "Đang chuẩn bị..." : "Bắt đầu trò chuyện"} <span>↗</span></button>
                    ) : (
                      <button className="restart-button" onClick={startConversation} disabled={conversationBusy}>↻ Bắt đầu lại</button>
                    )}
                  </div>
                  {activeConversation && (
                    <>
                      <div className="chat-thread" aria-live="polite">
                        {conversationMessages.map((item, index) => (
                          <div key={`${item.role}-${index}`} className={`chat-message ${item.role === "you" ? "from-you" : "from-partner"}`}>
                            {item.role === "partner" && <span className="chat-avatar">{selectedConversation.partner_name[0]}</span>}
                            <p>{item.text}</p>
                          </div>
                        ))}
                        {conversationBusy && <div className="chat-status">{selectedConversation.partner_name} đang trả lời...</div>}
                      </div>
                      {conversationFeedback && <div className="conversation-feedback"><span>✳</span>{conversationFeedback}</div>}
                      {!conversationFinished ? (
                        <form className="conversation-form" onSubmit={sendConversationReply}>
                          <textarea
                            aria-label="Câu trả lời trong hội thoại"
                            value={conversationInput}
                            onChange={(event) => setConversationInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                event.currentTarget.form?.requestSubmit();
                              }
                            }}
                            placeholder="Viết câu trả lời bằng tiếng Anh... (Enter để gửi)"
                            rows="2"
                          />
                          <button className={`mic-button ${conversationListening ? "recording" : ""}`} type="button" onClick={toggleConversationMicrophone} aria-label={conversationListening ? "Dừng nói" : "Trả lời bằng giọng nói"}>{conversationListening ? "■" : "●"}</button>
                          <button className="submit-button" type="submit" disabled={!conversationInput.trim() || conversationBusy}>Gửi <span>↗</span></button>
                        </form>
                      ) : (
                        <div className="conversation-complete"><span>✳</span> Hoàn thành hội thoại! Thử một tình huống khác để tiếp tục luyện tập.</div>
                      )}
                      <div className="phrase-list"><span>CỤM TỪ GỢI Ý</span>{selectedConversation.target_phrases.map((phrase) => <span className="phrase-chip" key={phrase}>{phrase}</span>)}</div>
                    </>
                  )}
                  {!activeConversation && <div className="scenario-preview"><span>✳</span> Bạn sẽ trò chuyện với {selectedConversation.partner_name} bằng tiếng Anh và nhận gợi ý diễn đạt sau mỗi lượt.</div>}
                </div>
              )}
            </section>

            {selectedLesson && (
              <section className="speaking-panel">
                <div className="speaking-topline"><span className="eyebrow">BÀI LUYỆN CỦA BẠN</span><span className="practice-level">{levelNames[selectedLesson.level]} · {selectedLesson.duration}</span></div>
                <div className="prompt-row"><div><h3>{selectedLesson.title}</h3><p className="prompt">{selectedLesson.prompt}</p></div><button className="listen-button" onClick={speakPrompt} aria-label="Nghe câu hỏi">▶</button></div>
                <div className="follow-up"><span className="follow-icon">↳</span><span><b>Câu hỏi tiếp theo</b><br />{selectedLesson.follow_up}</span></div>
                <form onSubmit={submitAnswer}>
                  <label className="answer-label" htmlFor="answer">CÂU TRẢ LỜI CỦA BẠN <span>{transcript.trim() ? transcript.trim().split(/\s+/).length : 0} từ</span></label>
                  <textarea id="answer" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Bắt đầu nói hoặc nhập câu trả lời bằng tiếng Anh tại đây..." rows="5" />
                  <div className="answer-actions">
                    <button className={`mic-button ${listening ? "recording" : ""}`} type="button" onClick={toggleMicrophone}><span>{listening ? "■" : "●"}</span>{listening ? "Dừng ghi âm" : "Bắt đầu nói"}</button>
                    <span className="privacy-note">Không lưu âm thanh; nhận dạng tùy trình duyệt.</span>
                    <button className="submit-button" type="submit" disabled={!transcript.trim()}>Chấm câu trả lời <span>↗</span></button>
                  </div>
                </form>
                {result && <Evaluation result={result} />}
              </section>
            )}
          </div>

          <aside className="side-column">
            <section className="side-card vocab-card" id="vocabulary">
              <div className="side-card-heading"><div><div className="eyebrow">HỌC TRONG NGỮ CẢNH</div><h3>Từ vựng hôm nay</h3></div><span className="side-icon">✳</span></div>
              {selectedLesson ? selectedLesson.vocabulary.map((item, index) => (
                <div className="vocab-item" key={item.word}><span className={`vocab-index color-${index}`}>0{index + 1}</span><div><button className="vocab-word-button" onClick={() => navigateTo(`/dictionary?word=${encodeURIComponent(item.word)}`)}>{item.word}</button><span>{item.meaning}</span><small>“{item.example}”</small></div></div>
              )) : <p className="empty-note">Chọn một chủ đề để xem từ vựng.</p>}
              <div className="vocab-footnote">Thử sử dụng các từ này trong câu trả lời nhé.</div>
            </section>
            <section className="side-card streak-card" id="progress"><div className="streak-top"><span className="streak-symbol">✳</span><span className="streak-tag">THÓI QUEN NHỎ, TIẾN BỘ LỚN</span></div><h3>Mỗi ngày một<br />chút là đủ.</h3><p>Chọn một chủ đề và bắt đầu buổi luyện tập đầu tiên của bạn hôm nay.</p><div className="week-row">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <span key={day}><i />{day}</span>)}</div></section>
            <div className="quote-card"><span>“</span><p>The only way to<br />learn a language is<br />to live it.</p><small>— A LITTLE REMINDER</small></div>
          </aside>
        </section>
      </main>
      <footer><span>© 2026 LingoUp</span><span>Học chậm thôi. Nhưng đừng dừng lại. <b>✳</b></span></footer>
    </div>
  );
}

function Evaluation({ result }) {
  return (
    <section className="evaluation" aria-live="polite">
      <div className="evaluation-score"><span>ĐIỂM BUỔI NÓI</span><strong>{result.score}<small>/100</small></strong><div className="score-track"><i style={{ width: `${result.score}%` }} /></div><small>{result.word_count} từ trong câu trả lời</small></div>
      <div className="evaluation-feedback">
        <h4>Điểm tốt</h4>
        {result.strengths.length ? <ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Đã hoàn thành lượt luyện nói đầu tiên!</p>}
        <h4>Thử cải thiện</h4><ul>{result.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="scoring-note">{result.scoring_note}</p>
      </div>
    </section>
  );
}

export default App;
