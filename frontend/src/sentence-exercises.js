function sampleEvenly(items, count) {
  if (count > items.length) {
    throw new Error(`Cannot sample ${count} unique sentences from ${items.length} candidates.`);
  }
  return Array.from({ length: count }, (_, index) =>
    items[Math.floor((index * items.length) / count)],
  );
}

function createExercises(level, groups) {
  const exercises = [];
  const usedSentences = new Set();

  groups.forEach(({ id, candidates, count }) => {
    sampleEvenly(candidates, count).forEach((item, index) => {
      const key = item.sentence.toLowerCase();
      if (usedSentences.has(key)) {
        throw new Error(`Duplicate generated sentence: ${item.sentence}`);
      }
      usedSentences.add(key);
      exercises.push({
        id: `generated-${level}-${id}-${index + 1}`,
        level,
        ...item,
      });
    });
  });

  if (exercises.length !== 340) {
    throw new Error(`Expected 340 generated ${level} exercises; got ${exercises.length}.`);
  }
  return exercises;
}

const subjects = [
  { english: "I", vietnamese: "Tôi", singular: false },
  { english: "We", vietnamese: "Chúng tôi", singular: false },
  { english: "My sister", vietnamese: "Em gái tôi", singular: true },
  { english: "My friends", vietnamese: "Bạn bè tôi", singular: false },
];

const frequencies = [
  { english: "usually", vietnamese: "thường" },
  { english: "often", vietnamese: "thường xuyên" },
  { english: "sometimes", vietnamese: "đôi khi" },
  { english: "always", vietnamese: "luôn" },
];

const activities = [
  { base: "drink tea", thirdPerson: "drinks tea", vietnamese: "uống trà" },
  { base: "read novels", thirdPerson: "reads novels", vietnamese: "đọc tiểu thuyết" },
  { base: "cook dinner", thirdPerson: "cooks dinner", vietnamese: "nấu bữa tối" },
  { base: "walk to work", thirdPerson: "walks to work", vietnamese: "đi bộ đến chỗ làm" },
  { base: "practice English", thirdPerson: "practices English", vietnamese: "luyện tiếng Anh" },
  { base: "listen to music", thirdPerson: "listens to music", vietnamese: "nghe nhạc" },
  { base: "call my family", thirdPerson: "calls her family", vietnamese: "gọi cho gia đình" },
  { base: "take the bus", thirdPerson: "takes the bus", vietnamese: "đi xe buýt" },
  { base: "make breakfast", thirdPerson: "makes breakfast", vietnamese: "làm bữa sáng" },
  { base: "visit my grandparents", thirdPerson: "visits her grandparents", vietnamese: "thăm ông bà" },
  { base: "clean my room", thirdPerson: "cleans her room", vietnamese: "dọn phòng" },
  { base: "watch a movie", thirdPerson: "watches a movie", vietnamese: "xem phim" },
  { base: "exercise", thirdPerson: "exercises", vietnamese: "tập thể dục" },
  { base: "go shopping", thirdPerson: "goes shopping", vietnamese: "đi mua sắm" },
  { base: "write in my journal", thirdPerson: "writes in her journal", vietnamese: "viết nhật ký" },
  { base: "water the plants", thirdPerson: "waters the plants", vietnamese: "tưới cây" },
  { base: "help my neighbors", thirdPerson: "helps her neighbors", vietnamese: "giúp đỡ hàng xóm" },
  { base: "prepare for class", thirdPerson: "prepares for class", vietnamese: "chuẩn bị cho buổi học" },
];

const routineTimes = [
  { english: "in the morning", vietnamese: "vào buổi sáng" },
  { english: "after work", vietnamese: "sau giờ làm" },
  { english: "on weekends", vietnamese: "vào cuối tuần" },
  { english: "before bed", vietnamese: "trước khi đi ngủ" },
];

const routineCandidates = [];
subjects.forEach((subject) => {
  frequencies.forEach((frequency) => {
    activities.forEach((activity) => {
      routineTimes.forEach((time) => {
        routineCandidates.push({
          sentence: `${subject.english} ${frequency.english} ${subject.singular ? activity.thirdPerson : activity.base} ${time.english}.`,
          meaning: `${subject.vietnamese} ${frequency.vietnamese} ${activity.vietnamese} ${time.vietnamese}.`,
        });
      });
    });
  });
});

const places = [
  { english: "bus stop", vietnamese: "trạm xe buýt", article: "a" },
  { english: "train station", vietnamese: "nhà ga", article: "a" },
  { english: "pharmacy", vietnamese: "nhà thuốc", article: "a" },
  { english: "ticket office", vietnamese: "quầy bán vé", article: "a" },
  { english: "restroom", vietnamese: "nhà vệ sinh", article: "a" },
  { english: "hotel", vietnamese: "khách sạn", article: "a" },
  { english: "supermarket", vietnamese: "siêu thị", article: "a" },
  { english: "post office", vietnamese: "bưu điện", article: "a" },
  { english: "meeting room", vietnamese: "phòng họp", article: "a" },
  { english: "printer", vietnamese: "máy in", article: "a" },
  { english: "parking garage", vietnamese: "nhà để xe", article: "a" },
  { english: "information desk", vietnamese: "quầy thông tin", article: "an" },
];

const directionCandidates = places.flatMap((place) => [
  {
    sentence: `Could you tell me where the ${place.english} is?`,
    meaning: `Bạn có thể cho tôi biết ${place.vietnamese} ở đâu không?`,
  },
  {
    sentence: `How do I get to the ${place.english}?`,
    meaning: `Tôi đi đến ${place.vietnamese} bằng cách nào?`,
  },
  {
    sentence: `Is there ${place.article} ${place.english} near here?`,
    meaning: `Có ${place.vietnamese} gần đây không?`,
  },
  {
    sentence: `Can you show me the way to the ${place.english}?`,
    meaning: `Bạn có thể chỉ đường đến ${place.vietnamese} cho tôi không?`,
  },
  {
    sentence: `I'm trying to find the ${place.english}.`,
    meaning: `Tôi đang cố tìm ${place.vietnamese}.`,
  },
]);

const errands = [
  { english: "buy some groceries", vietnamese: "mua ít thực phẩm" },
  { english: "call the clinic", vietnamese: "gọi cho phòng khám" },
  { english: "finish my homework", vietnamese: "làm xong bài tập" },
  { english: "pick up a package", vietnamese: "nhận một bưu kiện" },
  { english: "prepare dinner", vietnamese: "chuẩn bị bữa tối" },
  { english: "charge my phone", vietnamese: "sạc điện thoại" },
  { english: "send this message", vietnamese: "gửi tin nhắn này" },
  { english: "leave for work", vietnamese: "rời nhà đi làm" },
  { english: "clean the kitchen", vietnamese: "dọn nhà bếp" },
  { english: "check the schedule", vietnamese: "kiểm tra lịch trình" },
];

const errandTimes = [
  { english: "lunch", vietnamese: "bữa trưa" },
  { english: "tomorrow morning", vietnamese: "sáng mai" },
  { english: "the store closes", vietnamese: "cửa hàng đóng cửa" },
  { english: "my next meeting", vietnamese: "cuộc họp tiếp theo của tôi" },
  { english: "the bus leaves", vietnamese: "xe buýt khởi hành" },
  { english: "bedtime", vietnamese: "giờ đi ngủ" },
];

const errandCandidates = errands.flatMap((errand) =>
  errandTimes.map((time) => ({
    sentence: `I need to ${errand.english} before ${time.english}.`,
    meaning: `Tôi cần ${errand.vietnamese} trước ${time.vietnamese}.`,
  })),
);

const offers = [
  ["carry those bags", "mang những chiếc túi đó"],
  ["help you find the platform", "giúp bạn tìm sân ga"],
  ["hold the door", "giữ cửa"],
  ["make a quick call", "gọi điện nhanh"],
  ["pick up the groceries", "mua thực phẩm"],
  ["wait here", "đợi ở đây"],
  ["bring you a glass of water", "mang cho bạn một cốc nước"],
  ["show you the way", "chỉ đường cho bạn"],
  ["send you the address", "gửi địa chỉ cho bạn"],
  ["come by after work", "ghé qua sau giờ làm"],
  ["check the opening hours", "kiểm tra giờ mở cửa"],
  ["take a message", "ghi lại lời nhắn"],
  ["print a copy", "in một bản"],
  ["save you a seat", "giữ chỗ cho bạn"],
  ["call the restaurant", "gọi cho nhà hàng"],
  ["take a photo", "chụp ảnh"],
  ["meet you outside", "gặp bạn ở bên ngoài"],
  ["help you practice English", "giúp bạn luyện tiếng Anh"],
  ["bring an umbrella", "mang theo ô"],
  ["check the bus schedule", "kiểm tra lịch xe buýt"],
].map(([english, vietnamese]) => ({
  sentence: `I can ${english} if you need me to.`,
  meaning: `Tôi có thể ${vietnamese} nếu bạn cần.`,
}));

const beginnerExercises = createExercises("beginner", [
  { id: "routine", candidates: routineCandidates, count: 200 },
  { id: "directions", candidates: directionCandidates, count: 60 },
  { id: "errands", candidates: errandCandidates, count: 60 },
  { id: "offers", candidates: offers, count: 20 },
]);

const workActions = [
  ["review the draft", "xem lại bản nháp"],
  ["update the project timeline", "cập nhật tiến độ dự án"],
  ["confirm the meeting room", "xác nhận phòng họp"],
  ["share the latest figures", "chia sẻ số liệu mới nhất"],
  ["send the agenda", "gửi chương trình họp"],
  ["check the delivery date", "kiểm tra ngày giao hàng"],
  ["ask the client for feedback", "hỏi ý kiến khách hàng"],
  ["prepare a short summary", "chuẩn bị bản tóm tắt ngắn"],
  ["clarify the main requirement", "làm rõ yêu cầu chính"],
  ["discuss the budget", "thảo luận ngân sách"],
  ["contact the supplier", "liên hệ nhà cung cấp"],
  ["organize the shared files", "sắp xếp các tệp dùng chung"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const workPurposes = [
  ["everyone has the same information", "mọi người có cùng thông tin"],
  ["we can avoid confusion later", "chúng ta có thể tránh nhầm lẫn về sau"],
  ["the team has time to prepare", "nhóm có thời gian chuẩn bị"],
  ["we can identify open questions early", "chúng ta có thể sớm xác định những câu hỏi còn bỏ ngỏ"],
  ["the client receives a clear update", "khách hàng nhận được thông tin cập nhật rõ ràng"],
  ["we can make a decision sooner", "chúng ta có thể đưa ra quyết định sớm hơn"],
  ["each person knows what to do next", "mỗi người biết việc cần làm tiếp theo"],
  ["we can reduce the risk of delays", "chúng ta có thể giảm nguy cơ chậm trễ"],
  ["the next handoff goes smoothly", "việc bàn giao tiếp theo diễn ra suôn sẻ"],
  ["we have a record of the decision", "chúng ta có hồ sơ ghi lại quyết định"],
  ["the team can review the numbers", "nhóm có thể xem lại các số liệu"],
  ["we can respond before the deadline", "chúng ta có thể phản hồi trước hạn chót"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const workEvents = [
  ["the weekly team meeting", "cuộc họp nhóm hằng tuần"],
  ["the client call", "cuộc gọi với khách hàng"],
  ["the next project review", "buổi đánh giá dự án tiếp theo"],
  ["the end of the day", "cuối ngày hôm nay"],
  ["the next planning session", "buổi lập kế hoạch tiếp theo"],
  ["the product launch", "lễ ra mắt sản phẩm"],
  ["the budget review", "buổi xem xét ngân sách"],
  ["the next handoff", "lần bàn giao tiếp theo"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const workTimes = [
  ["this afternoon", "chiều nay"],
  ["tomorrow morning", "sáng mai"],
  ["before lunch", "trước bữa trưa"],
  ["by the end of the day", "trước khi hết ngày hôm nay"],
  ["before Friday", "trước thứ Sáu"],
  ["early next week", "vào đầu tuần sau"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const handoffActions = [
  ["share the final notes", "chia sẻ ghi chú cuối cùng"],
  ["confirm the owner for each task", "xác nhận người phụ trách từng nhiệm vụ"],
  ["send the updated schedule", "gửi lịch trình đã cập nhật"],
  ["review the open questions", "xem lại các câu hỏi còn bỏ ngỏ"],
  ["prepare the status report", "chuẩn bị báo cáo tình trạng"],
  ["check the figures with finance", "kiểm tra số liệu với bộ phận tài chính"],
  ["ask the design team for an update", "hỏi nhóm thiết kế về tiến độ"],
  ["collect the client's comments", "tổng hợp ý kiến của khách hàng"],
  ["write down the decisions", "ghi lại các quyết định"],
  ["organize a short follow-up call", "sắp xếp một cuộc gọi ngắn để trao đổi tiếp"],
  ["confirm the testing plan", "xác nhận kế hoạch kiểm thử"],
  ["share the revised proposal", "chia sẻ đề xuất đã chỉnh sửa"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const intermediateExercises = createExercises("intermediate", [
  {
    id: "purpose",
    count: 100,
    candidates: workActions.flatMap((action) =>
      workPurposes.map((purpose) => ({
        sentence: `We should ${action.english} so that ${purpose.english}.`,
        meaning: `Chúng ta nên ${action.vietnamese} để ${purpose.vietnamese}.`,
      })),
    ),
  },
  {
    id: "before-event",
    count: 80,
    candidates: workActions.flatMap((action) =>
      workEvents.map((event) => ({
        sentence: `Could we ${action.english} before ${event.english}?`,
        meaning: `Chúng ta có thể ${action.vietnamese} trước ${event.vietnamese} không?`,
      })),
    ),
  },
  {
    id: "team-update",
    count: 72,
    candidates: handoffActions.flatMap((action) =>
      workTimes.map((time) => ({
        sentence: `I'll ${action.english} ${time.english} so the team can prepare.`,
        meaning: `Tôi sẽ ${action.vietnamese} ${time.vietnamese} để nhóm có thể chuẩn bị.`,
      })),
    ),
  },
  {
    id: "during-event",
    count: 88,
    candidates: workActions.flatMap((action) =>
      workEvents.map((event) => ({
        sentence: `I think we should ${action.english} during ${event.english}.`,
        meaning: `Tôi nghĩ chúng ta nên ${action.vietnamese} trong ${event.vietnamese}.`,
      })),
    ),
  },
]);

const challenges = [
  ["the timeline is already tight", "tiến độ vốn đã khá gấp"],
  ["the supplier has not confirmed the date", "nhà cung cấp chưa xác nhận ngày giao hàng"],
  ["we have limited resources this quarter", "chúng ta có nguồn lực hạn chế trong quý này"],
  ["the requirements are still changing", "yêu cầu vẫn đang thay đổi"],
  ["the client has raised a new concern", "khách hàng đã nêu một mối lo mới"],
  ["the team is waiting on external feedback", "nhóm đang chờ ý kiến từ bên ngoài"],
  ["the budget has been reduced", "ngân sách đã bị cắt giảm"],
  ["we have very little time before launch", "thời gian trước ngày ra mắt còn rất ít"],
  ["two teams depend on the same resource", "hai nhóm đang phụ thuộc vào cùng một nguồn lực"],
  ["the initial estimate was too optimistic", "ước tính ban đầu quá lạc quan"],
  ["several decisions are still outstanding", "vẫn còn một số quyết định chưa được đưa ra"],
  ["the client wants additional features", "khách hàng muốn có thêm tính năng"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const solutions = [
  ["we can deliver the core features first", "chúng ta có thể bàn giao trước các tính năng cốt lõi"],
  ["we can revise the plan without changing the launch date", "chúng ta có thể chỉnh sửa kế hoạch mà không đổi ngày ra mắt"],
  ["we can agree on a phased rollout", "chúng ta có thể thống nhất triển khai theo từng giai đoạn"],
  ["we can assign a clear owner to each task", "chúng ta có thể giao rõ người phụ trách cho từng nhiệm vụ"],
  ["we can reduce the risk with an early review", "chúng ta có thể giảm rủi ro bằng cách xem xét sớm"],
  ["we can share a realistic timeline with the client", "chúng ta có thể chia sẻ tiến độ thực tế với khách hàng"],
  ["we can focus on the highest-impact work", "chúng ta có thể tập trung vào công việc có tác động lớn nhất"],
  ["we can test the change with a small group first", "chúng ta có thể thử thay đổi với một nhóm nhỏ trước"],
  ["we can move lower-priority items to the next release", "chúng ta có thể chuyển các mục ít ưu tiên hơn sang lần phát hành tiếp theo"],
  ["we can prepare a backup option", "chúng ta có thể chuẩn bị một phương án dự phòng"],
  ["we can ask the partner team for temporary support", "chúng ta có thể nhờ nhóm đối tác hỗ trợ tạm thời"],
  ["we can document the remaining assumptions", "chúng ta có thể ghi lại những giả định còn lại"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const conditions = [
  ["we confirm the priorities today", "chúng ta xác nhận các ưu tiên hôm nay"],
  ["the supplier responds by Wednesday", "nhà cung cấp phản hồi trước thứ Tư"],
  ["the stakeholders approve the revised scope", "các bên liên quan phê duyệt phạm vi đã chỉnh sửa"],
  ["we keep the communication open", "chúng ta duy trì trao đổi cởi mở"],
  ["the team agrees on the next steps", "nhóm thống nhất các bước tiếp theo"],
  ["we track the open risks each week", "chúng ta theo dõi các rủi ro còn mở mỗi tuần"],
  ["the client accepts the phased approach", "khách hàng chấp nhận cách triển khai theo giai đoạn"],
  ["a decision-maker joins the meeting", "người có quyền quyết định tham dự cuộc họp"],
  ["the testing team can start early", "nhóm kiểm thử có thể bắt đầu sớm"],
  ["we protect time for a final review", "chúng ta dành thời gian cho lần xem xét cuối"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const constraints = [
  ["the limited time remaining", "thời gian còn lại có hạn"],
  ["the current budget", "ngân sách hiện tại"],
  ["the feedback from the client", "ý kiến phản hồi từ khách hàng"],
  ["the dependency on the external team", "sự phụ thuộc vào nhóm bên ngoài"],
  ["the launch date we committed to", "ngày ra mắt chúng ta đã cam kết"],
  ["the testing capacity this month", "khả năng kiểm thử trong tháng này"],
  ["the number of open issues", "số lượng vấn đề còn tồn đọng"],
  ["the needs of our existing customers", "nhu cầu của khách hàng hiện tại"],
  ["the latest change in requirements", "thay đổi mới nhất trong yêu cầu"],
  ["the resources available to the team", "nguồn lực hiện có của nhóm"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const advancedActions = [
  ["revisit the rollout plan", "xem lại kế hoạch triển khai"],
  ["confirm the critical path", "xác nhận đường găng của dự án"],
  ["bring the key stakeholders together", "mời các bên liên quan chính cùng trao đổi"],
  ["document the assumptions", "ghi lại các giả định"],
  ["reassess the delivery date", "đánh giá lại ngày bàn giao"],
  ["separate essential work from optional requests", "tách phần việc thiết yếu khỏi các yêu cầu tùy chọn"],
  ["raise the issue with the steering group", "nêu vấn đề với ban chỉ đạo"],
  ["reserve time for an additional review", "dành thời gian cho một lần xem xét bổ sung"],
  ["clarify ownership across both teams", "làm rõ trách nhiệm giữa hai nhóm"],
  ["negotiate a phased delivery", "thương lượng việc bàn giao theo từng giai đoạn"],
  ["share the trade-offs with the client", "chia sẻ các điểm được và mất với khách hàng"],
  ["validate the estimate with the delivery team", "xác minh ước tính với nhóm triển khai"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const goals = [
  ["we can protect the quality of the release", "chúng ta có thể đảm bảo chất lượng bản phát hành"],
  ["we can make the decision with better information", "chúng ta có thể đưa ra quyết định dựa trên thông tin tốt hơn"],
  ["the teams can plan their work with confidence", "các nhóm có thể tự tin lên kế hoạch công việc"],
  ["we can avoid creating new dependencies", "chúng ta có thể tránh tạo thêm sự phụ thuộc mới"],
  ["the client has a clear view of the impact", "khách hàng hiểu rõ tác động"],
  ["we can preserve time for the final checks", "chúng ta có thể giữ thời gian cho các bước kiểm tra cuối"],
  ["each team understands its responsibilities", "mỗi nhóm hiểu rõ trách nhiệm của mình"],
  ["we can respond consistently to new requests", "chúng ta có thể phản hồi nhất quán trước các yêu cầu mới"],
  ["the launch remains achievable", "việc ra mắt vẫn khả thi"],
  ["we can identify risks before they affect delivery", "chúng ta có thể nhận diện rủi ro trước khi chúng ảnh hưởng đến bàn giao"],
  ["the proposed change can be evaluated fairly", "thay đổi được đề xuất có thể được đánh giá công bằng"],
  ["we maintain a reliable record of the decision", "chúng ta duy trì hồ sơ đáng tin cậy về quyết định"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const gerunds = [
  ["waiting for the final numbers", "chờ số liệu cuối cùng"],
  ["adding every request to the first release", "đưa mọi yêu cầu vào bản phát hành đầu tiên"],
  ["expanding the scope again", "mở rộng phạm vi thêm lần nữa"],
  ["scheduling another large meeting", "lên lịch thêm một cuộc họp lớn"],
  ["making a decision without the client", "đưa ra quyết định khi chưa trao đổi với khách hàng"],
  ["delaying the discussion until next month", "trì hoãn cuộc thảo luận đến tháng sau"],
  ["repeating the same manual checks", "lặp lại những bước kiểm tra thủ công giống nhau"],
  ["assigning the work without checking availability", "giao việc khi chưa kiểm tra mức độ sẵn sàng"],
  ["rewriting the whole proposal", "viết lại toàn bộ đề xuất"],
  ["treating every issue as equally urgent", "coi mọi vấn đề đều cấp bách như nhau"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const benefits = [
  ["keep the launch date realistic", "giữ ngày ra mắt ở mức khả thi"],
  ["give the team time to validate the change", "cho nhóm thời gian xác minh thay đổi"],
  ["make the ownership clearer", "làm rõ trách nhiệm hơn"],
  ["reduce the risk of rework", "giảm nguy cơ phải làm lại"],
  ["keep the client informed", "giúp khách hàng nắm được thông tin"],
  ["protect the most important requirements", "bảo vệ những yêu cầu quan trọng nhất"],
  ["make better use of the available budget", "sử dụng ngân sách hiện có hiệu quả hơn"],
  ["give stakeholders time to review the impact", "cho các bên liên quan thời gian xem xét tác động"],
  ["avoid introducing unnecessary complexity", "tránh đưa thêm sự phức tạp không cần thiết"],
  ["keep the next handoff on track", "giữ cho lần bàn giao tiếp theo đúng tiến độ"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const outcomes = [
  ["reduce uncertainty for the partner team", "giảm sự không chắc chắn cho nhóm đối tác"],
  ["deliver the highest-priority work first", "bàn giao phần việc ưu tiên cao nhất trước"],
  ["give the client a clearer choice", "đưa ra lựa chọn rõ ràng hơn cho khách hàng"],
  ["preserve time for quality checks", "dành thời gian cho việc kiểm tra chất lượng"],
  ["avoid delaying the dependent work", "tránh làm chậm phần việc phụ thuộc"],
  ["make the change easier to review", "giúp việc xem xét thay đổi dễ dàng hơn"],
  ["keep the team focused on the agreed goal", "giúp nhóm tập trung vào mục tiêu đã thống nhất"],
  ["provide a more reliable estimate", "đưa ra ước tính đáng tin cậy hơn"],
  ["address the concern before the next release", "giải quyết mối lo trước lần phát hành tiếp theo"],
  ["keep the project within the approved budget", "giữ dự án trong phạm vi ngân sách đã duyệt"],
  ["make the handoff clearer for everyone", "giúp việc bàn giao rõ ràng hơn với mọi người"],
  ["reduce the chance of a last-minute change", "giảm khả năng có thay đổi vào phút chót"],
].map(([english, vietnamese]) => ({ english, vietnamese }));

const advancedExercises = createExercises("advanced", [
  {
    id: "although",
    count: 120,
    candidates: challenges.flatMap((challenge) =>
      solutions.flatMap((solution) =>
        conditions.map((condition) => ({
          sentence: `Although ${challenge.english}, ${solution.english} if ${condition.english}.`,
          meaning: `Dù ${challenge.vietnamese}, ${solution.vietnamese} nếu ${condition.vietnamese}.`,
        })),
      ),
    ),
  },
  {
    id: "given",
    count: 100,
    candidates: constraints.flatMap((constraint) =>
      advancedActions.flatMap((action) =>
        goals.map((goal) => ({
          sentence: `Given ${constraint.english}, we should ${action.english} so that ${goal.english}.`,
          meaning: `Với ${constraint.vietnamese}, chúng ta nên ${action.vietnamese} để ${goal.vietnamese}.`,
        })),
      ),
    ),
  },
  {
    id: "rather-than",
    count: 60,
    candidates: gerunds.flatMap((gerund) =>
      advancedActions.flatMap((action) =>
        benefits.map((benefit) => ({
          sentence: `Rather than ${gerund.english}, we could ${action.english} to ${benefit.english}.`,
          meaning: `Thay vì ${gerund.vietnamese}, chúng ta có thể ${action.vietnamese} để ${benefit.vietnamese}.`,
        })),
      ),
    ),
  },
  {
    id: "provided-that",
    count: 60,
    candidates: advancedActions.flatMap((action) =>
      outcomes.flatMap((outcome) =>
        conditions.map((condition) => ({
          sentence: `If we ${action.english}, we can ${outcome.english}, provided that ${condition.english}.`,
          meaning: `Nếu chúng ta ${action.vietnamese}, chúng ta có thể ${outcome.vietnamese}, với điều kiện ${condition.vietnamese}.`,
        })),
      ),
    ),
  },
]);

export const GENERATED_EXERCISES = [
  ...beginnerExercises,
  ...intermediateExercises,
  ...advancedExercises,
];
