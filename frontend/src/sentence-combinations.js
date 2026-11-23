export const COMBINATIONS_PER_LEVEL = 400000;

const pairList = (items) => items.map((item) => {
  const [english, vietnamese] = item.split("|");
  return { english, vietnamese };
});

const subjects = [
  { english: "I", vietnamese: "Tôi", thirdPerson: false, possessive: "my", possessiveVietnamese: "tôi" },
  { english: "We", vietnamese: "Chúng tôi", thirdPerson: false, possessive: "our", possessiveVietnamese: "chúng tôi" },
  { english: "My sister", vietnamese: "Em gái tôi", thirdPerson: true, possessive: "her", possessiveVietnamese: "em gái tôi" },
  { english: "My brother", vietnamese: "Anh trai tôi", thirdPerson: true, possessive: "his", possessiveVietnamese: "anh trai tôi" },
  { english: "My friends", vietnamese: "Bạn bè tôi", thirdPerson: false, possessive: "their", possessiveVietnamese: "bạn bè tôi" },
];

const frequencies = pairList([
  "usually|thường",
  "often|thường xuyên",
  "sometimes|đôi khi",
  "always|luôn",
  "rarely|hiếm khi",
]);

const routineTimes = [
  ["in the morning", "vào buổi sáng"],
  ["in the evening", "vào buổi tối"],
  ["on weekends", "vào cuối tuần"],
  ["after dinner", "sau bữa tối"],
  ["before bed", "trước khi đi ngủ"],
  ["during a quiet moment", "trong một khoảnh khắc yên tĩnh"],
  ["after a busy day", "sau một ngày bận rộn"],
  ["during {possessive} free time", "trong thời gian rảnh của {possessiveVietnamese}"],
  ["after work", "sau giờ làm"],
  ["after class", "sau giờ học"],
  ["during the holidays", "trong kỳ nghỉ"],
  ["when I get home", "khi về nhà"],
  ["during a short break", "trong giờ nghỉ ngắn"],
  ["at lunchtime", "vào giờ ăn trưa"],
  ["when the weather is nice", "khi thời tiết đẹp"],
  ["after a long day", "sau một ngày dài"],
];

const routineFamilies = [
  {
    verb: ["read", "reads", "đọc"],
    modifiers: pairList(["interesting|thú vị", "short|ngắn", "useful|hữu ích", "popular|phổ biến", "recent|mới", "classic|kinh điển", "local|địa phương", "detailed|chi tiết", "funny|hài hước", "educational|mang tính giáo dục"]),
    nouns: pairList(["novels|tiểu thuyết", "articles|bài báo", "magazines|tạp chí", "stories|truyện ngắn", "reports|báo cáo", "biographies|tiểu sử", "guides|cẩm nang", "comics|truyện tranh", "essays|bài luận", "newspapers|tờ báo"]),
  },
  {
    verb: ["watch", "watches", "xem"],
    modifiers: pairList(["interesting|thú vị", "short|ngắn", "new|mới", "popular|phổ biến", "educational|mang tính giáo dục", "funny|hài hước", "local|địa phương", "exciting|hấp dẫn", "classic|kinh điển", "informative|cung cấp nhiều thông tin"]),
    nouns: pairList(["films|phim", "documentaries|phim tài liệu", "cooking videos|video nấu ăn", "travel shows|chương trình du lịch", "sports matches|trận đấu thể thao", "interviews|buổi phỏng vấn", "tutorials|video hướng dẫn", "comedy shows|chương trình hài", "nature programs|chương trình thiên nhiên", "news reports|bản tin"]),
  },
  {
    verb: ["listen to", "listens to", "nghe"],
    modifiers: pairList(["interesting|thú vị", "short|ngắn", "new|mới", "popular|phổ biến", "educational|mang tính giáo dục", "funny|hài hước", "local|địa phương", "inspiring|truyền cảm hứng", "classic|kinh điển", "informative|cung cấp nhiều thông tin"]),
    nouns: pairList(["podcasts|chương trình podcast", "audiobooks|sách nói", "playlists|danh sách nhạc", "radio shows|chương trình phát thanh", "interviews|buổi phỏng vấn", "lectures|bài giảng", "language lessons|bài học ngôn ngữ", "news reports|bản tin", "recordings|bản ghi âm", "audio stories|truyện âm thanh"]),
  },
  {
    verb: ["practice", "practices", "luyện"],
    modifiers: pairList(["basic|cơ bản", "useful|hữu ích", "new|mới", "everyday|hằng ngày", "spoken|nói", "practical|thực tế", "advanced|nâng cao", "challenging|có tính thử thách", "common|thông dụng", "workplace|công sở"]),
    nouns: pairList(["English phrases|cụm từ tiếng Anh", "vocabulary items|từ vựng", "conversation skills|kỹ năng giao tiếp", "listening exercises|bài luyện nghe", "short dialogues|đoạn hội thoại", "pronunciation drills|bài luyện phát âm", "interview answers|câu trả lời phỏng vấn", "presentation skills|kỹ năng thuyết trình", "common expressions|cách diễn đạt thông dụng", "grammar patterns|mẫu ngữ pháp"]),
  },
  {
    verb: ["cook", "cooks", "nấu"],
    modifiers: pairList(["simple|đơn giản", "quick|nhanh", "healthy|lành mạnh", "delicious|ngon", "traditional|truyền thống", "spicy|cay", "vegetarian|chay", "homemade|tự làm", "seasonal|theo mùa", "new|mới"]),
    nouns: pairList(["meals|bữa ăn", "soups|món súp", "vegetable dishes|món rau", "quick lunches|bữa trưa nhanh", "family recipes|món theo công thức gia đình", "healthy snacks|món ăn nhẹ lành mạnh", "local dishes|món địa phương", "pasta recipes|món mì Ý", "fresh desserts|món tráng miệng tươi", "weeknight dinners|bữa tối ngày thường"]),
  },
  {
    verb: ["visit", "visits", "thăm"],
    modifiers: pairList(["nearby|gần đây", "local|địa phương", "famous|nổi tiếng", "historic|có ý nghĩa lịch sử", "quiet|yên tĩnh", "beautiful|đẹp", "popular|phổ biến", "small|nhỏ", "interesting|thú vị", "new|mới"]),
    nouns: pairList(["parks|công viên", "museums|bảo tàng", "markets|khu chợ", "art galleries|phòng trưng bày nghệ thuật", "beaches|bãi biển", "historic sites|di tích lịch sử", "small towns|thị trấn nhỏ", "gardens|khu vườn", "bookstores|hiệu sách", "villages|ngôi làng"]),
  },
  {
    verb: ["learn", "learns", "học"],
    modifiers: pairList(["useful|hữu ích", "new|mới", "simple|đơn giản", "traditional|truyền thống", "popular|phổ biến", "practical|thực tế", "creative|sáng tạo", "basic|cơ bản", "advanced|nâng cao", "everyday|hằng ngày"]),
    nouns: pairList(["languages|ngôn ngữ", "phrases|cụm từ", "computer skills|kỹ năng máy tính", "recipes|công thức nấu ăn", "songs|bài hát", "cultural traditions|truyền thống văn hóa", "travel tips|mẹo du lịch", "new skills|kỹ năng mới", "local customs|phong tục địa phương", "conversation topics|chủ đề hội thoại"]),
  },
  {
    verb: ["prepare", "prepares", "chuẩn bị"],
    modifiers: pairList(["simple|đơn giản", "healthy|lành mạnh", "quick|nhanh", "special|đặc biệt", "traditional|truyền thống", "vegetarian|chay", "family|gia đình", "weekend|cuối tuần", "fresh|tươi", "favorite|yêu thích"]),
    nouns: pairList(["breakfasts|bữa sáng", "lunches|bữa trưa", "dinners|bữa tối", "snacks|món ăn nhẹ", "picnics|buổi dã ngoại", "family meals|bữa ăn gia đình", "packed meals|các phần ăn mang theo", "holiday meals|bữa ăn ngày lễ", "desserts|món tráng miệng", "drinks|đồ uống"]),
  },
  {
    verb: ["explore", "explores", "khám phá"],
    modifiers: pairList(["nearby|gần đây", "local|địa phương", "famous|nổi tiếng", "historic|có ý nghĩa lịch sử", "quiet|yên tĩnh", "beautiful|đẹp", "popular|phổ biến", "small|nhỏ", "interesting|thú vị", "new|mới"]),
    nouns: pairList(["neighborhoods|khu phố", "coastal towns|thị trấn ven biển", "walking trails|đường đi bộ", "local markets|khu chợ địa phương", "city streets|đường phố", "nature reserves|khu bảo tồn thiên nhiên", "old buildings|tòa nhà cổ", "small islands|hòn đảo nhỏ", "food markets|chợ ẩm thực", "cultural centers|trung tâm văn hóa"]),
  },
  {
    verb: ["try", "tries", "thử"],
    modifiers: pairList(["new|mới", "simple|đơn giản", "healthy|lành mạnh", "popular|phổ biến", "traditional|truyền thống", "creative|sáng tạo", "local|địa phương", "different|khác lạ", "easy|dễ", "seasonal|theo mùa"]),
    nouns: pairList(["recipes|công thức nấu ăn", "dishes|món ăn", "sports|môn thể thao", "hobbies|sở thích", "activities|hoạt động", "desserts|món tráng miệng", "language games|trò chơi ngôn ngữ", "exercise routines|bài tập thể dục", "local foods|món ăn địa phương", "weekend activities|hoạt động cuối tuần"]),
  },
];

const routineActions = routineFamilies.flatMap((family) =>
  family.modifiers.flatMap((modifier) =>
    family.nouns.map((noun) => ({
      base: `${family.verb[0]} ${modifier.english} ${noun.english}`,
      thirdPerson: `${family.verb[1]} ${modifier.english} ${noun.english}`,
      vietnamese: `${family.verb[2]} những ${noun.vietnamese} ${modifier.vietnamese}`,
    })),
  ),
);

const intermediateVerbs = pairList([
  "review|xem lại",
  "prepare|chuẩn bị",
  "update|cập nhật",
  "organize|sắp xếp",
  "discuss|thảo luận",
  "compare|so sánh",
  "confirm|xác nhận",
  "share|chia sẻ",
  "summarize|tóm tắt",
  "document|ghi lại",
]);

const workModifiers = pairList([
  "latest|mới nhất",
  "revised|đã chỉnh sửa",
  "current|hiện tại",
  "proposed|được đề xuất",
  "detailed|chi tiết",
  "updated|đã cập nhật",
  "initial|ban đầu",
  "outstanding|còn tồn đọng",
  "critical|then chốt",
  "final|cuối cùng",
]);

const workNouns = pairList([
  "project plan|kế hoạch dự án",
  "delivery timeline|tiến độ bàn giao",
  "meeting agenda|chương trình họp",
  "client proposal|đề xuất cho khách hàng",
  "budget forecast|dự báo ngân sách",
  "test results|kết quả kiểm thử",
  "risk register|danh sách rủi ro",
  "action items|các việc cần làm",
  "release plan|kế hoạch phát hành",
  "vendor quote|báo giá của nhà cung cấp",
]);

const intermediateActions = intermediateVerbs.flatMap((verb) =>
  workModifiers.flatMap((modifier) =>
    workNouns.map((noun) => ({
      english: `${verb.english} the ${modifier.english} ${noun.english}`,
      vietnamese: `${verb.vietnamese} ${noun.vietnamese} ${modifier.vietnamese}`,
    })),
  ),
);

const intermediateTimes = pairList([
  "before the client meeting|trước cuộc họp với khách hàng",
  "by the end of the day|trước khi hết ngày hôm nay",
  "before the next review|trước buổi đánh giá tiếp theo",
  "during this planning cycle|trong đợt lập kế hoạch này",
  "ahead of the product launch|trước khi ra mắt sản phẩm",
  "before we finalize the plan|trước khi chúng ta chốt kế hoạch",
  "after we hear from the supplier|sau khi nhận được phản hồi từ nhà cung cấp",
  "before Friday afternoon|trước chiều thứ Sáu",
  "at the start of next week|vào đầu tuần sau",
  "before the team makes a decision|trước khi nhóm đưa ra quyết định",
]);

const purposes = pairList([
  "everyone understands the next steps|mọi người hiểu các bước tiếp theo",
  "we can avoid confusion later|chúng ta có thể tránh nhầm lẫn về sau",
  "the team has enough time to prepare|nhóm có đủ thời gian chuẩn bị",
  "we can identify open questions early|chúng ta có thể sớm xác định những câu hỏi còn bỏ ngỏ",
  "the client receives a clear update|khách hàng nhận được thông tin cập nhật rõ ràng",
  "we can make a decision sooner|chúng ta có thể đưa ra quyết định sớm hơn",
  "each person knows what to do next|mỗi người biết việc cần làm tiếp theo",
  "we can reduce the risk of delays|chúng ta có thể giảm nguy cơ chậm trễ",
  "the next handoff goes smoothly|việc bàn giao tiếp theo diễn ra suôn sẻ",
  "we have a record of the decision|chúng ta có hồ sơ ghi lại quyết định",
  "the team can review the numbers|nhóm có thể xem lại các số liệu",
  "we can respond before the deadline|chúng ta có thể phản hồi trước hạn chót",
  "the supplier knows what we need|nhà cung cấp biết chúng ta cần gì",
  "we can keep the project on schedule|chúng ta có thể giữ dự án đúng tiến độ",
  "the meeting stays focused|cuộc họp tập trung vào đúng trọng tâm",
  "we can set realistic expectations|chúng ta có thể đặt kỳ vọng thực tế",
  "the right people are included|đúng người được tham gia",
  "we can spot a possible issue|chúng ta có thể phát hiện vấn đề tiềm ẩn",
  "the team shares the same priorities|nhóm có chung các ưu tiên",
  "we can plan the remaining work|chúng ta có thể lên kế hoạch cho phần việc còn lại",
  "the client has time to review the proposal|khách hàng có thời gian xem xét đề xuất",
  "we can agree on the delivery date|chúng ta có thể thống nhất ngày bàn giao",
  "the decision is based on current information|quyết định dựa trên thông tin hiện tại",
  "we can explain the change clearly|chúng ta có thể giải thích thay đổi một cách rõ ràng",
  "everyone knows who owns each task|mọi người biết ai phụ trách từng nhiệm vụ",
  "we can avoid doing the same work twice|chúng ta có thể tránh làm trùng công việc",
  "the team can raise concerns early|nhóm có thể nêu mối lo sớm",
  "we can use the available time well|chúng ta có thể sử dụng tốt thời gian hiện có",
  "the project goals remain clear|mục tiêu dự án vẫn rõ ràng",
  "we can prepare for the next milestone|chúng ta có thể chuẩn bị cho cột mốc tiếp theo",
  "the update reaches everyone involved|thông tin cập nhật đến được mọi người liên quan",
  "we can track progress more easily|chúng ta có thể theo dõi tiến độ dễ dàng hơn",
  "the team can coordinate its work|nhóm có thể phối hợp công việc",
  "we can address the request promptly|chúng ta có thể xử lý yêu cầu kịp thời",
  "the plan reflects the latest feedback|kế hoạch phản ánh ý kiến mới nhất",
  "we can keep the scope manageable|chúng ta có thể giữ phạm vi công việc trong tầm kiểm soát",
  "the review process is more efficient|quy trình xem xét hiệu quả hơn",
  "we can share the workload fairly|chúng ta có thể phân chia khối lượng công việc hợp lý",
  "the team can confirm its assumptions|nhóm có thể xác nhận các giả định",
  "we can move forward with confidence|chúng ta có thể tự tin tiếp tục",
]);

const advancedVerbs = pairList([
  "reassess|đánh giá lại",
  "prioritize|ưu tiên",
  "validate|xác minh",
  "negotiate|thương lượng",
  "align|điều chỉnh cho thống nhất",
  "document|ghi lại",
  "address|giải quyết",
  "streamline|tinh giản",
  "adjust|điều chỉnh",
  "review|xem xét",
]);

const advancedModifiers = pairList([
  "proposed|được đề xuất",
  "existing|hiện có",
  "high-priority|có mức ưu tiên cao",
  "cross-team|liên nhóm",
  "long-term|dài hạn",
  "revised|đã chỉnh sửa",
  "contractual|theo hợp đồng",
  "technical|kỹ thuật",
  "operational|vận hành",
  "strategic|chiến lược",
]);

const advancedNouns = pairList([
  "project scope|phạm vi dự án",
  "delivery commitments|cam kết bàn giao",
  "resource allocation|phân bổ nguồn lực",
  "release strategy|chiến lược phát hành",
  "testing approach|cách tiếp cận kiểm thử",
  "stakeholder expectations|kỳ vọng của các bên liên quan",
  "vendor terms|điều khoản với nhà cung cấp",
  "implementation plan|kế hoạch triển khai",
  "client requirements|yêu cầu của khách hàng",
  "risk controls|biện pháp kiểm soát rủi ro",
]);

const advancedActions = advancedVerbs.flatMap((verb) =>
  advancedModifiers.flatMap((modifier) =>
    advancedNouns.map((noun) => ({
      english: `${verb.english} the ${modifier.english} ${noun.english}`,
      vietnamese: `${verb.vietnamese} ${noun.vietnamese} ${modifier.vietnamese}`,
    })),
  ),
);

const constraints = pairList([
  "the fixed launch date|ngày ra mắt cố định",
  "the current contractual obligations|nghĩa vụ hợp đồng hiện tại",
  "the limited testing capacity|khả năng kiểm thử có hạn",
  "the scope agreed with the client|phạm vi đã thống nhất với khách hàng",
  "the dependency on the external team|sự phụ thuộc vào nhóm bên ngoài",
  "the approved budget for this quarter|ngân sách đã duyệt trong quý này",
  "the remaining implementation time|thời gian triển khai còn lại",
  "the new regulatory requirement|yêu cầu pháp lý mới",
  "the operational needs of the support team|nhu cầu vận hành của nhóm hỗ trợ",
  "the uncertainty in the latest estimate|những điểm chưa chắc chắn trong ước tính mới nhất",
]);

const conditions = pairList([
  "the client approves the revised scope|khách hàng phê duyệt phạm vi đã chỉnh sửa",
  "the team agrees on the decision criteria|nhóm thống nhất các tiêu chí ra quyết định",
  "we preserve time for final validation|chúng ta dành thời gian cho bước xác minh cuối cùng",
  "the supplier confirms its availability|nhà cung cấp xác nhận khả năng đáp ứng",
  "each team has a clear owner|mỗi nhóm có người phụ trách rõ ràng",
  "we communicate the trade-offs early|chúng ta trao đổi sớm về những điểm được và mất",
  "the new estimate is reviewed by finance|ước tính mới được bộ phận tài chính xem xét",
  "stakeholders understand the impact|các bên liên quan hiểu được tác động",
  "the delivery team can support the transition|nhóm bàn giao có thể hỗ trợ quá trình chuyển đổi",
  "we track the open risks every week|chúng ta theo dõi các rủi ro còn mở mỗi tuần",
  "the client accepts a phased approach|khách hàng chấp nhận cách tiếp cận theo giai đoạn",
  "a decision-maker joins the discussion|người có quyền quyết định tham gia thảo luận",
  "the testing team can start early|nhóm kiểm thử có thể bắt đầu sớm",
  "we document the remaining assumptions|chúng ta ghi lại các giả định còn lại",
  "the partner team shares its timeline|nhóm đối tác chia sẻ tiến độ",
  "we receive the required data on time|chúng ta nhận được dữ liệu cần thiết đúng hạn",
  "the revised plan stays within budget|kế hoạch đã chỉnh sửa vẫn nằm trong ngân sách",
  "the support team has enough capacity|nhóm hỗ trợ có đủ khả năng đáp ứng",
  "we agree on a measurable outcome|chúng ta thống nhất một kết quả có thể đo lường",
  "the change does not add a critical dependency|thay đổi không tạo thêm sự phụ thuộc trọng yếu",
  "the legal team confirms the terms|nhóm pháp lý xác nhận các điều khoản",
  "we have a backup option available|chúng ta có sẵn phương án dự phòng",
  "the project owner confirms the priority|chủ dự án xác nhận mức độ ưu tiên",
  "we leave room for a final review|chúng ta dành thời gian cho lần xem xét cuối",
  "the affected teams are consulted|các nhóm bị ảnh hưởng được tham vấn",
  "the proposed metrics are clearly defined|các chỉ số được đề xuất được xác định rõ",
  "we resolve the main open question|chúng ta giải quyết câu hỏi chính còn bỏ ngỏ",
  "the vendor meets the service requirements|nhà cung cấp đáp ứng các yêu cầu dịch vụ",
  "the change is tested with a small group|thay đổi được thử nghiệm với một nhóm nhỏ",
  "we can explain the rationale to the client|chúng ta có thể giải thích lý do cho khách hàng",
  "the updated timeline is realistic|tiến độ đã cập nhật là thực tế",
  "the team has access to the necessary tools|nhóm có quyền truy cập các công cụ cần thiết",
  "we confirm the handoff responsibilities|chúng ta xác nhận trách nhiệm bàn giao",
  "the review includes the latest feedback|buổi xem xét có bao gồm ý kiến mới nhất",
  "we protect the quality requirements|chúng ta đảm bảo các yêu cầu chất lượng",
  "the remaining work is estimated accurately|phần việc còn lại được ước tính chính xác",
  "the new approach is approved by leadership|cách tiếp cận mới được ban lãnh đạo phê duyệt",
  "we keep the communication channel open|chúng ta duy trì kênh trao đổi thông suốt",
  "the expected benefit justifies the effort|lợi ích dự kiến xứng đáng với công sức bỏ ra",
  "all owners confirm their next steps|tất cả người phụ trách xác nhận bước tiếp theo",
]);

const combinationCounts = [
  subjects.length * frequencies.length * routineActions.length * routineTimes.length,
  intermediateActions.length * intermediateTimes.length * purposes.length,
  advancedVerbs.length * advancedModifiers.length * advancedNouns.length * constraints.length * conditions.length,
];
if (combinationCounts.some((count) => count !== COMBINATIONS_PER_LEVEL)) {
  throw new Error("Sentence combination catalog dimensions do not match the advertised count.");
}

export function getCombinatorialExercise(level, index) {
  if (!Number.isInteger(index) || index < 0 || index >= COMBINATIONS_PER_LEVEL) {
    throw new RangeError("Sentence exercise index is out of range.");
  }

  if (level === "beginner") {
    const timeIndex = index % routineTimes.length;
    const actionIndex = Math.floor(index / routineTimes.length) % routineActions.length;
    const frequencyIndex = Math.floor(index / (routineTimes.length * routineActions.length)) % frequencies.length;
    const subjectIndex = Math.floor(index / (routineTimes.length * routineActions.length * frequencies.length));
    const subject = subjects[subjectIndex];
    const frequency = frequencies[frequencyIndex];
    const action = routineActions[actionIndex];
    const time = routineTimes[timeIndex];
    const englishTime = time[0].replace("{possessive}", subject.possessive);
    const vietnameseTime = time[1].replace("{possessiveVietnamese}", subject.possessiveVietnamese);
    return {
      id: `combination-${level}-${index}`,
      level,
      sentence: `${subject.english} ${frequency.english} ${subject.thirdPerson ? action.thirdPerson : action.base} ${englishTime}.`,
      meaning: `${subject.vietnamese} ${frequency.vietnamese} ${action.vietnamese} ${vietnameseTime}.`,
    };
  }

  if (level === "intermediate") {
    const purposeIndex = index % purposes.length;
    const timeIndex = Math.floor(index / purposes.length) % intermediateTimes.length;
    const actionIndex = Math.floor(index / (purposes.length * intermediateTimes.length));
    const action = intermediateActions[actionIndex];
    const time = intermediateTimes[timeIndex];
    const purpose = purposes[purposeIndex];
    return {
      id: `combination-${level}-${index}`,
      level,
      sentence: `We should ${action.english} ${time.english} so that ${purpose.english}.`,
      meaning: `Chúng ta nên ${action.vietnamese} ${time.vietnamese} để ${purpose.vietnamese}.`,
    };
  }

  if (level === "advanced") {
    const conditionIndex = index % conditions.length;
    const constraintIndex = Math.floor(index / conditions.length) % constraints.length;
    const actionIndex = Math.floor(index / (conditions.length * constraints.length));
    const action = advancedActions[actionIndex];
    const constraint = constraints[constraintIndex];
    const condition = conditions[conditionIndex];
    return {
      id: `combination-${level}-${index}`,
      level,
      sentence: `Given ${constraint.english}, we should ${action.english}, provided that ${condition.english}.`,
      meaning: `Với ${constraint.vietnamese}, chúng ta nên ${action.vietnamese}, với điều kiện ${condition.vietnamese}.`,
    };
  }

  throw new Error(`Unknown sentence practice level: ${level}`);
}
