import { useEffect, useMemo, useState } from "react";
import { COMBINATIONS_PER_LEVEL, getCombinatorialExercise } from "./sentence-combinations.js";
import { GENERATED_EXERCISES } from "./sentence-exercises.js";
import "./sentence-builder.css";

const LEVELS = [
  { id: "beginner", label: "Cơ bản" },
  { id: "intermediate", label: "Trung bình" },
  { id: "advanced", label: "Nâng cao" },
];

const BASE_EXERCISES = [
  { id: "tea", level: "beginner", meaning: "Tôi muốn một tách trà, làm ơn.", sentence: "I'd like a cup of tea, please." },
  { id: "bus-stop", level: "beginner", meaning: "Bạn có thể chỉ cho tôi trạm xe buýt ở đâu không?", sentence: "Could you tell me where the bus stop is?" },
  { id: "walk-to-work", level: "beginner", meaning: "Tôi thường đi bộ đến chỗ làm vào buổi sáng.", sentence: "I usually walk to work in the morning." },
  { id: "menu", level: "beginner", meaning: "Cho tôi xin thực đơn được không?", sentence: "Can I have the menu, please?" },
  { id: "train-station", level: "beginner", meaning: "Tôi đang tìm nhà ga.", sentence: "I'm looking for the train station." },
  { id: "join-lunch", level: "beginner", meaning: "Bạn có muốn ăn trưa cùng chúng tôi không?", sentence: "Would you like to join us for lunch?" },
  { id: "move-meeting", level: "intermediate", meaning: "Chúng ta có thể chuyển cuộc họp sang chiều thứ Năm không?", sentence: "Could we move the meeting to Thursday afternoon?" },
  { id: "updated-file", level: "intermediate", meaning: "Tôi sẽ gửi bạn tệp đã cập nhật trước khi hết ngày hôm nay.", sentence: "I'll send you the updated file before the end of the day." },
  { id: "explain-again", level: "intermediate", meaning: "Bạn có phiền giải thích lại điều đó một lần nữa không?", sentence: "Would you mind explaining that one more time?" },
  { id: "ask-feedback", level: "intermediate", meaning: "Tôi nghĩ chúng ta nên hỏi ý kiến nhóm trước khi quyết định.", sentence: "I think we should ask the team for feedback before we decide." },
  { id: "rainy-walk", level: "intermediate", meaning: "Mặc dù trời mưa, chúng tôi vẫn tận hưởng chuyến đi bộ.", sentence: "Although it was raining, we still enjoyed the walk." },
  { id: "order-ready", level: "intermediate", meaning: "Bạn có thể cho tôi biết khi nào đơn hàng sẵn sàng không?", sentence: "Could you let me know when the order is ready?" },
  { id: "review-risks", level: "advanced", meaning: "Trước khi chốt kế hoạch, hãy cùng xem xét các rủi ro.", sentence: "Before we finalize the plan, let's review the risks together." },
  { id: "narrow-scope", level: "advanced", meaning: "Nếu thu hẹp phạm vi, chúng ta có thể giao phiên bản đầu đúng hạn.", sentence: "If we narrow the scope, we can deliver the first version on time." },
  { id: "compare-options", level: "advanced", meaning: "Dù hiểu mối lo của bạn, tôi nghĩ chúng ta nên so sánh cả hai lựa chọn.", sentence: "While I understand your concern, I think we should compare both options." },
  { id: "supplier-date", level: "advanced", meaning: "Chúng ta có thể cần điều chỉnh tiến độ trừ khi nhà cung cấp xác nhận ngày giao hàng.", sentence: "We may need to adjust the timeline unless the supplier confirms the delivery date." },
  { id: "summarize-decisions", level: "advanced", meaning: "Bạn có thể tóm tắt các quyết định chính và chia sẻ với cả nhóm không?", sentence: "Could you summarize the key decisions and share them with the group?" },
  { id: "revise-proposal", level: "advanced", meaning: "Sau khi cân nhắc góp ý, tôi đề xuất chúng ta chỉnh sửa đề án.", sentence: "Having considered the feedback, I recommend that we revise the proposal." },
];

const EXERCISES = [...BASE_EXERCISES, ...GENERATED_EXERCISES];
const EXERCISES_BY_LEVEL = Object.fromEntries(
  LEVELS.map((item) => [item.id, EXERCISES.filter((exercise) => exercise.level === item.id)]),
);
const LEVEL_COUNTS = Object.fromEntries(
  LEVELS.map((item) => [item.id, EXERCISES_BY_LEVEL[item.id].length + COMBINATIONS_PER_LEVEL]),
);
const TOTAL_EXERCISES = Object.values(LEVEL_COUNTS).reduce((total, count) => total + count, 0);
const formatCount = (count) => count.toLocaleString("vi-VN");

function shuffleTiles(sentence) {
  const shuffled = sentence.split(/\s+/).map((text, id) => ({ id, text }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (shuffled.length > 1 && shuffled.every((tile, index) => tile.id === index)) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

function normalizeSentence(sentence) {
  return sentence.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
}

function SentenceBuilder() {
  const [level, setLevel] = useState("beginner");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [solvedIds, setSolvedIds] = useState([]);
  const [finished, setFinished] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const [navigationError, setNavigationError] = useState("");
  const exercises = EXERCISES_BY_LEVEL[level];
  const totalExercises = LEVEL_COUNTS[level];
  const exercise = useMemo(
    () => exerciseIndex < exercises.length
      ? exercises[exerciseIndex]
      : getCombinatorialExercise(level, exerciseIndex - exercises.length),
    [exerciseIndex, exercises, level],
  );
  const wordCount = exercise.sentence.split(/\s+/).length;
  const isCorrect = feedback === "correct";

  useEffect(() => {
    setAvailableTiles(shuffleTiles(exercise.sentence));
    setSelectedTiles([]);
    setFeedback("");
    setHintVisible(false);
  }, [exercise]);

  function changeLevel(nextLevel) {
    if (nextLevel === level) return;
    setLevel(nextLevel);
    setExerciseIndex(0);
    setSolvedIds([]);
    setFinished(false);
    setJumpValue("");
    setNavigationError("");
  }

  function selectTile(tile) {
    setAvailableTiles((current) => current.filter((item) => item.id !== tile.id));
    setSelectedTiles((current) => [...current, tile]);
    setFeedback("");
  }

  function removeTile(tile) {
    setSelectedTiles((current) => current.filter((item) => item.id !== tile.id));
    setAvailableTiles((current) => [...current, tile].sort((first, second) => first.id - second.id));
    setFeedback("");
  }

  function checkAnswer() {
    if (selectedTiles.length !== wordCount) {
      setFeedback("incomplete");
      return;
    }
    const answer = selectedTiles.map((tile) => tile.text).join(" ");
    if (normalizeSentence(answer) === normalizeSentence(exercise.sentence)) {
      setFeedback("correct");
      setSolvedIds((current) => current.includes(exercise.id) ? current : [...current, exercise.id]);
    } else {
      setFeedback("incorrect");
    }
  }

  function moveToNextExercise() {
    if (exerciseIndex === totalExercises - 1) {
      setFinished(true);
      return;
    }
    setExerciseIndex((current) => current + 1);
    setJumpValue(String(exerciseIndex + 2));
    setNavigationError("");
  }

  function restartLevel() {
    setExerciseIndex(0);
    setSolvedIds([]);
    setFinished(false);
    setJumpValue("");
    setNavigationError("");
  }

  function jumpToExercise(event) {
    event.preventDefault();
    const requestedNumber = Number(jumpValue);
    if (!Number.isInteger(requestedNumber) || requestedNumber < 1 || requestedNumber > totalExercises) {
      setNavigationError(`Nhập số câu từ 1 đến ${formatCount(totalExercises)}.`);
      return;
    }
    setExerciseIndex(requestedNumber - 1);
    setJumpValue(String(requestedNumber));
    setNavigationError("");
  }

  function selectRandomExercise() {
    let randomIndex = Math.floor(Math.random() * totalExercises);
    if (randomIndex === exerciseIndex) randomIndex = (randomIndex + 1) % totalExercises;
    setExerciseIndex(randomIndex);
    setJumpValue(String(randomIndex + 1));
    setNavigationError("");
  }

  function speakAnswer() {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setFeedback("unsupported");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(exercise.sentence);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="sentence-builder" id="sentence-builder">
      <div className="sentence-builder-heading">
        <div>
          <div className="eyebrow">LUYỆN CẤU TRÚC CÂU</div>
          <h2>Ghép từ thành câu <span className="lesson-count">{formatCount(TOTAL_EXERCISES)}</span></h2>
        </div>
        <span className="sentence-builder-tag">WORD ORDER · ENGLISH</span>
      </div>
      <p className="sentence-builder-intro">Hơn một triệu câu theo ba cấp độ. Sắp xếp từ, kiểm tra đáp án và nghe cách đọc câu mẫu.</p>
      <div className="sentence-level-tabs" role="tablist" aria-label="Cấp độ ghép câu">
        {LEVELS.map((item) => (
          <button
            key={item.id}
            className={level === item.id ? "selected" : ""}
            onClick={() => changeLevel(item.id)}
            role="tab"
            aria-selected={level === item.id}
          >
            {item.label} · {formatCount(LEVEL_COUNTS[item.id])}
          </button>
        ))}
      </div>
      {!finished && (
        <div className="sentence-catalog-controls">
          <button type="button" className="sentence-secondary-button" onClick={selectRandomExercise}>Câu ngẫu nhiên <span>↻</span></button>
          <form onSubmit={jumpToExercise}>
            <label htmlFor="sentence-jump">Đến câu</label>
            <input
              id="sentence-jump"
              type="number"
              min="1"
              max={totalExercises}
              value={jumpValue}
              onChange={(event) => {
                setJumpValue(event.target.value);
                setNavigationError("");
              }}
              aria-label={`Số câu từ 1 đến ${formatCount(totalExercises)}`}
            />
            <span>/ {formatCount(totalExercises)}</span>
            <button type="submit" className="sentence-secondary-button">Mở</button>
          </form>
        </div>
      )}
      {navigationError && <p className="sentence-feedback sentence-feedback-incomplete" role="alert">{navigationError}</p>}
      {finished ? (
        <div className="sentence-complete" role="status">
          <span className="sentence-complete-icon">✳</span>
          <h3>Hoàn thành cấp độ {LEVELS.find((item) => item.id === level)?.label.toLowerCase()}!</h3>
          <p>Bạn đã ghép đúng {formatCount(solvedIds.length)} / {formatCount(totalExercises)} câu.</p>
          <button className="submit-button" onClick={restartLevel}>Luyện lại <span>↻</span></button>
        </div>
      ) : (
        <div className="sentence-exercise">
          <div className="sentence-exercise-meta">
            <span>CÂU {formatCount(exerciseIndex + 1)} / {formatCount(totalExercises)}</span>
            <span>ĐÃ ĐÚNG {formatCount(solvedIds.length)} / {formatCount(totalExercises)}</span>
          </div>
          <p className="sentence-meaning">{exercise.meaning}</p>
          <div className="sentence-answer-area" aria-label="Câu bạn đang ghép">
            {selectedTiles.length ? selectedTiles.map((tile) => (
              <button
                type="button"
                key={tile.id}
                className="sentence-tile sentence-tile-selected"
                onClick={() => removeTile(tile)}
                disabled={isCorrect}
                aria-label={`Bỏ từ ${tile.text} khỏi câu`}
              >
                {tile.text}
              </button>
            )) : <span className="sentence-placeholder">Chọn từ bên dưới để ghép thành câu...</span>}
          </div>
          <div className="sentence-word-bank" aria-label="Các từ có thể chọn">
            {availableTiles.map((tile) => (
              <button
                type="button"
                key={tile.id}
                className="sentence-tile"
                onClick={() => selectTile(tile)}
                disabled={isCorrect}
              >
                {tile.text}
              </button>
            ))}
          </div>
          {hintVisible && <p className="sentence-hint">Gợi ý: Câu bắt đầu bằng <strong>{exercise.sentence.split(/\s+/)[0]}</strong></p>}
          {feedback && (
            <p className={`sentence-feedback sentence-feedback-${feedback}`} role="status" aria-live="polite">
              {feedback === "correct" && "Chính xác! Bạn đã sắp xếp đúng câu."}
              {feedback === "incorrect" && "Câu chưa đúng. Hãy thử đổi vị trí các từ."}
              {feedback === "incomplete" && `Bạn còn thiếu ${wordCount - selectedTiles.length} từ.`}
              {feedback === "unsupported" && "Trình duyệt này chưa hỗ trợ phát âm câu mẫu."}
            </p>
          )}
          <div className="sentence-actions">
            <button type="button" className="sentence-secondary-button" onClick={() => setHintVisible(true)}>Gợi ý</button>
            <button type="button" className="sentence-secondary-button" onClick={speakAnswer}>Nghe câu mẫu</button>
            <button type="button" className="sentence-secondary-button" disabled={isCorrect} onClick={() => {
              setAvailableTiles(shuffleTiles(exercise.sentence));
              setSelectedTiles([]);
              setFeedback("");
            }}>Làm lại</button>
            {isCorrect ? (
              <button type="button" className="submit-button" onClick={moveToNextExercise}>
                {exerciseIndex === totalExercises - 1 ? "Xem kết quả" : "Câu tiếp theo"} <span>↗</span>
              </button>
            ) : (
              <button type="button" className="submit-button" onClick={checkAnswer} disabled={!selectedTiles.length}>Kiểm tra <span>↗</span></button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default SentenceBuilder;
