import { useEffect, useMemo, useRef, useState } from "react";
import frequencyWords from "./data/english_frequency_words_10k.json";
import "./dictionary.css";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");
const LEVEL_NAMES = {
  beginner: "Nhóm 1 · 1–3.000",
  intermediate: "Nhóm 2 · 3.001–6.500",
  advanced: "Nhóm 3 · 6.501–10.000",
};
const FREQUENCY_WORDS = frequencyWords.map((word, index) => ({
  word,
  meaning: "",
  example: "",
  level: index < 3000 ? "beginner" : index < 6500 ? "intermediate" : "advanced",
  category: "Từ phổ biến",
  frequencyRank: index + 1,
}));
const PAGE_SIZE = 50;
const TRANSLATION_CACHE_KEY = "speakbetter-vietnamese-translations-v1";

async function translateToVietnamese(text, signal) {
  const params = new URLSearchParams({
    q: text.slice(0, 450),
    langpair: "en|vi",
  });
  const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, { signal });
  const data = await response.json();
  if (data.quotaFinished || /quota|daily limit/i.test(data.responseDetails || "")) {
    throw new Error("Đã hết hạn mức dịch miễn phí hôm nay. Có thể thử lại khi hạn mức được làm mới.");
  }
  if (!response.ok || data.responseStatus !== 200) {
    throw new Error(
      data.responseDetails || "Dịch vụ dịch đang bận hoặc đã hết hạn mức miễn phí hôm nay.",
    );
  }
  const translation = data.responseData?.translatedText?.trim();
  if (!translation) throw new Error("Dịch vụ chưa trả về nghĩa tiếng Việt cho từ này.");
  return translation;
}

function DictionaryPage({ onHome }) {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("word") || "");
  const [levelFilter, setLevelFilter] = useState("all");
  const [vocabulary, setVocabulary] = useState([]);
  const [searchedWords, setSearchedWords] = useState([]);
  const [loadingVocabulary, setLoadingVocabulary] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingDefinition, setLoadingDefinition] = useState({});
  const [searchError, setSearchError] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [page, setPage] = useState(1);
  const [translations, setTranslations] = useState({});
  const [translationStatus, setTranslationStatus] = useState({});
  const [translationErrors, setTranslationErrors] = useState({});
  const [translationRetry, setTranslationRetry] = useState(0);
  const [translationCacheReady, setTranslationCacheReady] = useState(false);
  const [translationStorageWarning, setTranslationStorageWarning] = useState("");
  const [activePracticeWord, setActivePracticeWord] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState({});
  const recognitionRef = useRef(null);
  const searchRequestRef = useRef(null);
  const activeLookupWordRef = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/lessons`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Không tải được danh sách từ vựng.");
        return response.json();
      })
      .then((lessons) => {
        const words = new Map();
        lessons.forEach((lesson) => {
          lesson.vocabulary.forEach((item) => {
            const key = item.word.toLowerCase();
            if (!words.has(key)) {
              words.set(key, {
                ...item,
                vietnameseMeaning: item.meaning,
                level: lesson.level,
                category: lesson.category,
                source: lesson.title,
                isCurriculumWord: true,
              });
            }
          });
        });
        const catalog = Array.from(words.values());
        setVocabulary(catalog);
        const initialWord = new URLSearchParams(window.location.search).get("word")?.trim();
        if (initialWord) {
          setQuery(initialWord);
          if (!catalog.some((item) => item.word.toLowerCase() === initialWord.toLowerCase())) {
            searchWord(undefined, initialWord);
          }
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCatalogError(error.message || "Không kết nối được backend.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingVocabulary(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TRANSLATION_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Dữ liệu nghĩa đã lưu không đúng định dạng.");
        }
        setTranslations(
          Object.fromEntries(
            Object.entries(parsed).filter(([, value]) => typeof value === "string"),
          ),
        );
      }
    } catch (error) {
      setTranslationStorageWarning(
        `Không đọc được nghĩa đã lưu trên trình duyệt: ${error.message}`,
      );
    } finally {
      setTranslationCacheReady(true);
    }
  }, []);

  useEffect(() => {
    if (!translationCacheReady || !Object.keys(translations).length) return;
    try {
      window.localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translations));
      setTranslationStorageWarning("");
    } catch (error) {
      setTranslationStorageWarning(`Không thể lưu nghĩa vào trình duyệt: ${error.message}`);
    }
  }, [translationCacheReady, translations]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    searchRequestRef.current?.abort();
  }, []);

  const allWords = useMemo(() => {
    const words = new Map(FREQUENCY_WORDS.map((item) => [item.word, item]));
    vocabulary.forEach((item) => {
      const key = item.word.toLowerCase();
      words.set(key, { ...words.get(key), ...item, frequencyRank: words.get(key)?.frequencyRank });
    });
    searchedWords.forEach((item) => {
      const key = item.word.toLowerCase();
      words.set(key, { ...words.get(key), ...item, frequencyRank: words.get(key)?.frequencyRank });
    });
    return Array.from(words.values());
  }, [searchedWords, vocabulary]);
  const visibleWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allWords.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.word.toLowerCase().includes(normalizedQuery) ||
        item.meaning.toLowerCase().includes(normalizedQuery) ||
        item.vietnameseMeaning?.toLowerCase().includes(normalizedQuery);
      const matchesLevel = levelFilter === "all" || item.level === levelFilter;
      return matchesQuery && matchesLevel;
    });
  }, [allWords, levelFilter, query]);
  const pageCount = Math.max(1, Math.ceil(visibleWords.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageWords = useMemo(
    () => visibleWords.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart, visibleWords],
  );
  const translatedPageCount = pageWords.filter(
    (item) => item.vietnameseMeaning || translations[item.word.toLowerCase()],
  ).length;

  useEffect(() => setPage(1), [query, levelFilter]);

  useEffect(() => {
    if (!translationCacheReady || loadingVocabulary) return undefined;
    const pending = pageWords.filter((item) => {
      const key = item.word.toLowerCase();
      return !item.isCurriculumWord && !translations[key] && !translationStatus[key];
    });
    if (!pending.length) return undefined;

    const controller = new AbortController();
    setTranslationStatus((current) => {
      const next = { ...current };
      pending.forEach((item) => { next[item.word.toLowerCase()] = "loading"; });
      return next;
    });
    let nextIndex = 0;
    async function translateWorker() {
      while (nextIndex < pending.length && !controller.signal.aborted) {
        const item = pending[nextIndex];
        nextIndex += 1;
        const key = item.word.toLowerCase();
        const sourceText = item.meaning && !item.isCurriculumWord ? item.meaning : item.word;
        try {
          const meaning = await translateToVietnamese(sourceText, controller.signal);
          if (controller.signal.aborted) return;
          setTranslations((current) => ({ ...current, [key]: meaning }));
          setTranslationStatus((current) => ({ ...current, [key]: "done" }));
          setTranslationErrors((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        } catch (error) {
          if (error.name !== "AbortError" && !controller.signal.aborted) {
            if (error.message.startsWith("Đã hết hạn mức dịch miễn phí hôm nay")) {
              setTranslationStatus((current) => {
                const next = { ...current };
                pending.forEach((word) => { next[word.word.toLowerCase()] = "error"; });
                return next;
              });
              setTranslationErrors((current) => {
                const next = { ...current };
                pending.forEach((word) => { next[word.word.toLowerCase()] = error.message; });
                return next;
              });
              controller.abort();
              return;
            }
            setTranslationStatus((current) => ({ ...current, [key]: "error" }));
            setTranslationErrors((current) => ({ ...current, [key]: error.message }));
          }
        }
      }
    }
    Promise.all(Array.from({ length: Math.min(8, pending.length) }, () => translateWorker()));
    return () => {
      controller.abort();
      setTranslationStatus((current) => {
        const next = { ...current };
        pending.forEach((item) => {
          const key = item.word.toLowerCase();
          if (next[key] === "loading") delete next[key];
        });
        return next;
      });
    };
  }, [loadingVocabulary, pageWords, translationCacheReady, translationRetry]);

  function searchWord(event, wordOverride) {
    event?.preventDefault();
    const word = (wordOverride ?? query).trim();
    if (!word) {
      setSearchError("Nhập một từ tiếng Anh để tra cứu.");
      return;
    }

    async function retryTranslation(item) {
      const key = item.word.toLowerCase();
      setTranslationStatus((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setTranslationErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setTranslationRetry((current) => current + 1);
    }

    setQuery(word);
    setLevelFilter("all");
    setSearchError("");
    setSearchStatus("");
    const existingWord = allWords.find((item) => item.word.toLowerCase() === word.toLowerCase());
    if (existingWord) {
      if (!existingWord.definitions?.length) {
        fetchDefinition(word);
        return;
      }
      setSearchStatus(`“${existingWord.word}” đã có trong danh sách từ vựng.`);
      document.getElementById("dictionary-word-list")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    fetchDefinition(word);
  }

  function fetchDefinition(word) {
    searchRequestRef.current?.abort();
    if (activeLookupWordRef.current) {
      setLoadingDefinition((current) => ({ ...current, [activeLookupWordRef.current]: false }));
    }
    const controller = new AbortController();
    searchRequestRef.current = controller;
    activeLookupWordRef.current = word;
    setSearching(true);
    setLoadingDefinition((current) => ({ ...current, [word]: true }));
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? `Chưa tìm thấy “${word}”. Thử kiểm tra chính tả nhé.`
              : data.message || "Không thể tra từ lúc này. Hãy thử lại sau.",
          );
        }
        return data;
      })
      .then((entries) => {
        const results = entries.map((entry) => {
          const definitions = (entry.meanings || []).flatMap((meaning) =>
            (meaning.definitions || []).slice(0, 3).map((definition) => ({
              partOfSpeech: meaning.partOfSpeech,
              definition: definition.definition,
              example: definition.example,
            })),
          );
          const existingWord = allWords.find((item) => item.word.toLowerCase() === entry.word.toLowerCase());
          return {
            ...existingWord,
            word: entry.word,
            meaning: definitions[0]?.definition || existingWord?.meaning || "Meaning not available.",
            example: definitions.find((definition) => definition.example)?.example || existingWord?.example || "",
            phonetic: entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || "",
            definitions,
            category: existingWord?.category || "Từ tra cứu",
            source: existingWord?.source || "English dictionary",
          };
        });
        const hasNewWords = results.some((result) => !currentWordsContain(result.word));
        setSearchedWords((current) => {
          const updated = new Map(current.map((item) => [item.word.toLowerCase(), item]));
          results.forEach((result) => updated.set(result.word.toLowerCase(), result));
          return Array.from(updated.values());
        });
        if (hasNewWords) {
          setSearchStatus(`Đã thêm “${entries[0].word}” vào danh sách từ của bạn.`);
        } else {
          setSearchStatus(`Đã tải nghĩa cho “${entries[0].word}”.`);
        }
        document.getElementById("dictionary-word-list")?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSearchError(
            error instanceof TypeError
              ? "Không kết nối được từ điển. Hãy kiểm tra mạng rồi thử lại."
              : error.message,
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSearching(false);
          setLoadingDefinition((current) => ({ ...current, [word]: false }));
        }
      });
  }

  function currentWordsContain(word) {
    return allWords.some((item) => item.word.toLowerCase() === word.toLowerCase());
  }

  function speakWord(word) {
    if (!window.speechSynthesis) {
      setPracticeFeedback((current) => ({
        ...current,
        [word]: "Trình duyệt này chưa hỗ trợ phát giọng đọc.",
      }));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang === "en-US");
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function practiceWord(word) {
    if (activePracticeWord === word) {
      recognitionRef.current?.stop();
      setActivePracticeWord("");
      setPracticeFeedback((current) => ({ ...current, [word]: "Đã dừng luyện phát âm." }));
      return;
    }
    if (activePracticeWord) {
      recognitionRef.current?.stop();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPracticeFeedback((current) => ({
        ...current,
        [word]: "Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy nghe mẫu trên Chrome rồi thử lại.",
      }));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.trim();
      const normalize = (value) => value.toLowerCase().replace(/[^a-z']/g, "");
      setPracticeFeedback((current) => ({
        ...current,
        [word]:
          normalize(heard) === normalize(word)
            ? `Đã nhận diện “${heard}” — tốt lắm!`
            : `Đã nghe “${heard}”. Nghe mẫu rồi thử đọc lại “${word}” nhé.`,
      }));
    };
    recognition.onerror = () => {
      if (recognitionRef.current === recognition) {
        setPracticeFeedback((current) => ({
          ...current,
          [word]: "Chưa nhận được giọng nói. Kiểm tra quyền micro rồi thử lại.",
        }));
        setActivePracticeWord("");
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) setActivePracticeWord("");
    };
    setPracticeFeedback((current) => ({ ...current, [word]: "Đang nghe bạn đọc..." }));
    setActivePracticeWord(word);
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      setActivePracticeWord("");
      setPracticeFeedback((current) => ({
        ...current,
        [word]: error.message || "Không thể bật micro. Hãy thử lại.",
      }));
    }
  }

  return (
    <div className="dictionary-page">
      <header className="topbar dictionary-topbar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onHome(); }} aria-label="LingoUp trang chủ">
          <span className="brand-mark">L</span>
          <span>Lingo<span className="brand-dot">Up.</span></span>
        </a>
        <a className="dictionary-back-link" href="/" onClick={(event) => { event.preventDefault(); onHome(); }}>← Quay lại luyện tập</a>
      </header>

      <main className="dictionary-main">
        <div className="dictionary-page-heading">
          <div className="eyebrow">MỞ RỘNG VỐN TỪ · LUYỆN TỪNG NGÀY</div>
          <h1>Từ điển của bạn<span>.</span></h1>
          <p>Tra từ mới, xem nghĩa và luyện phát âm cho từng từ trong danh sách.</p>
        </div>

        <form className="dictionary-search dictionary-page-search" onSubmit={(event) => searchWord(event)}>
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Tìm trong danh sách hoặc tra từ mới"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm từ trong danh sách hoặc tra từ mới..."
            maxLength={100}
          />
          <button type="submit" disabled={searching}>{searching ? "Đang tra..." : "Tra từ"} <span>↗</span></button>
        </form>
        {searchError && <p className="dictionary-error" role="alert">{searchError}</p>}
        {searchStatus && <p className="dictionary-success" role="status">{searchStatus}</p>}

        <section className="word-list-section" id="dictionary-word-list">
          <div className="word-list-heading">
            <div><h2>Danh sách từ vựng</h2><p>{loadingVocabulary ? "Đang tải từ vựng..." : `${visibleWords.length.toLocaleString("vi-VN")} từ · ${translatedPageCount}/${pageWords.length} từ trang này đã có nghĩa tiếng Việt`}</p></div>
            <label>
              <span className="sr-only">Lọc theo cấp độ</span>
              <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Nhóm 1 · 1–3.000 từ phổ biến nhất</option>
                <option value="intermediate">Nhóm 2 · 3.001–6.500</option>
                <option value="advanced">Nhóm 3 · 6.501–10.000</option>
              </select>
            </label>
          </div>
          {catalogError && <p className="dictionary-error" role="alert">{catalogError}</p>}
          {!loadingVocabulary && visibleWords.length === 0 && (
            <div className="word-list-empty">Không có từ phù hợp. Nhấn <b>Tra từ</b> để tìm từ mới trong từ điển.</div>
          )}
          <div className="word-list">
            {pageWords.map((item, index) => {
              const key = item.word.toLowerCase();
              const vietnameseMeaning = item.vietnameseMeaning || translations[key];
              return (
              <article className="word-card" key={`${item.word}-${index}`}>
                <div className="word-card-index">{String(item.frequencyRank || pageStart + index + 1).padStart(5, "0")}</div>
                <div className="word-card-content">
                  <div className="word-card-title">
                    <h3>{item.word}</h3>
                    {item.phonetic && <span className="phonetic-text">{item.phonetic}</span>}
                    <span className="word-level">{item.frequencyRank ? `Phổ biến #${item.frequencyRank.toLocaleString("vi-VN")}` : item.level ? LEVEL_NAMES[item.level] : "Từ tra cứu"}</span>
                  </div>
                  {vietnameseMeaning
                    ? <p className="word-meaning"><b>Tiếng Việt:</b> {vietnameseMeaning}</p>
                    : <p className="word-meaning-empty">{translationStatus[key] === "loading" ? "Đang tải nghĩa tiếng Việt..." : translationErrors[key] || "Đang chờ nghĩa tiếng Việt."}</p>}
                  {item.meaning && !item.isCurriculumWord && <p className="word-example"><b>English:</b> {item.meaning}</p>}
                  {item.example && <p className="word-example">“{item.example}”</p>}
                  {item.definitions?.length > 1 && (
                    <details className="more-definitions">
                      <summary>Xem thêm nghĩa</summary>
                      <ul>{item.definitions.slice(1, 5).map((definition, definitionIndex) => <li key={`${definition.definition}-${definitionIndex}`}><i>{definition.partOfSpeech}</i> — {definition.definition}</li>)}</ul>
                    </details>
                  )}
                  {practiceFeedback[item.word] && <p className="word-practice-feedback" aria-live="polite">{practiceFeedback[item.word]}</p>}
                </div>
                <div className="word-card-actions">
                  {!item.definitions?.length && (
                    <button type="button" className="word-lookup-button" onClick={() => fetchDefinition(item.word)} disabled={loadingDefinition[item.word]}>{loadingDefinition[item.word] ? "Đang tra Anh" : "Nghĩa Anh"}</button>
                  )}
                  {translationStatus[key] === "error" && <button type="button" className="word-lookup-button" onClick={() => retryTranslation(item)}>Thử dịch lại</button>}
                  <button type="button" className="word-listen-button" onClick={() => speakWord(item.word)} aria-label={`Nghe phát âm ${item.word}`}>▶ Nghe</button>
                  <button
                    type="button"
                    className={`word-practice-button ${activePracticeWord === item.word ? "is-listening" : ""}`}
                    onClick={() => practiceWord(item.word)}
                  >{activePracticeWord === item.word ? "■ Dừng" : "● Luyện đọc"}</button>
                </div>
              </article>
            );
            })}
          </div>
          {pageCount > 1 && (
            <div className="word-pagination">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>← Trước</button>
              <span>Trang {page.toLocaleString("vi-VN")} / {pageCount.toLocaleString("vi-VN")}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Tiếp →</button>
            </div>
          )}
        </section>

        {translationStorageWarning && <p className="dictionary-page-note">{translationStorageWarning}</p>}
        <p className="dictionary-page-note">10.000 từ được xếp theo tần suất xuất hiện trong phụ đề hội thoại và chia thành ba nhóm tần suất, không phải cấp độ CEFR chính thức. Nghĩa tiếng Việt của trang đang xem được dịch tự động và lưu trong trình duyệt; từ tra được gửi tới <a href="https://mymemory.translated.net/" target="_blank" rel="noreferrer">MyMemory</a> (hạn mức miễn phí theo ngày). Định nghĩa tiếng Anh lấy theo yêu cầu từ <a href="https://dictionaryapi.dev/" target="_blank" rel="noreferrer">Free Dictionary API</a>. Nhận diện phát âm chỉ là phản hồi tham khảo.</p>
      </main>
    </div>
  );
}

export default DictionaryPage;
