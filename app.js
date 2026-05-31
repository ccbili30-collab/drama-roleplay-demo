const DEFAULT_SOURCE_URL = "";

const SOURCE_INFO = {
  kicker: "STORY LINK",
  title: "海上旧约",
};

const GAME_LOADING_STEPS = ["正在坠入剧情"];

const tools = [
  { name: "旧书海图", effect: { clue: 4 }, note: "强化线索" },
  { name: "分账旧约", effect: { prestige: 3 }, note: "强化威望" },
  { name: "木箱钥匙", effect: { survival: 3 }, note: "强化生存" },
];

const characters = {
  hero: { name: "你", side: "right", sprite: "./assets/sprites/hero.png" },
  uncle: { name: "大伯", side: "left", sprite: "./assets/sprites/uncle.png" },
  accountant: { name: "账房", side: "left", sprite: "./assets/sprites/accountant.png" },
  aqi: { name: "阿七", side: "left", sprite: "./assets/sprites/aqi.png" },
};

const chapters = [
  {
    presentation: "image",
    backdrop: "./assets/galgame-seaside-banquet.png",
    title: "宴席逼问",
    speaker: "大伯",
    text: "你怎么在这片海上活下去？",
    setup: "宴席忽然静了下来。你刚提到当年的分账旧约，桌上的人全都看向大伯。",
    prose: [
      "灯火压在桌面上，旧书海图、分账旧约和木箱钥匙像三把还没出鞘的刀。",
      "你必须先选一种活下去的姿态，是当众掀桌，还是先忍住，把真正的入口逼出来。",
    ],
    dialogues: [
      { actor: "uncle", text: "你怎么在这片海上活下去？" },
      { actor: "hero", text: "靠真账，靠旧约，也靠你们当年不敢写进族谱的那条航线。" },
      { actor: "uncle", text: "年轻人，知道得太快，死得也快。" },
    ],
    choices: [
      {
        label: "逼他认账",
        text: "当众逼大伯承认当年的分账约定。",
        effect: { prestige: 14, alert: 12, survival: -4 },
        result: "你没有退。桌边的年轻船工第一次抬头看你，大伯的笑却一点点冷了下去。",
      },
      {
        label: "亮出海图",
        text: "拿出旧书海图，反问他为何怕这片海。",
        effect: { clue: 16, alert: 10, prestige: 4 },
        result: "海图一露，屋里有几个人同时变了脸。大伯盯住了图角的坐标。",
      },
      {
        label: "观察站队",
        text: "先忍住，观察谁站在大伯那边，谁在回避你的目光。",
        effect: { allies: 12, survival: 8, prestige: -2 },
        result: "你把话咽了回去，只盯每个人的眼神。账房悄悄摸了一下袖口。",
      },
    ],
  },
  {
    presentation: "image",
    backdrop: "./assets/accountant-alley.png",
    title: "账房袖口",
    speaker: "账房",
    text: "当年的账不是不能查，只是查了以后，就没人还能装作自己干净。",
    setup: "宴席散后，账房从后门离开。他走得很慢，像是在等一个胆子够大的人跟上来。",
    prose: [
      "酒气被后门的风吹散，巷子里只剩潮湿的木味和远处码头的铁锈声。",
      "账房把袖口攥得很紧，像是里面藏着一张会要命的纸。",
    ],
    dialogues: [
      { actor: "accountant", text: "别再跟了。你再往前一步，我今晚就走不出这条巷子。" },
      { actor: "hero", with: "accountant", text: "你袖子里藏的不是账，是能救你命的东西。" },
      { actor: "accountant", text: "救命？那张纸只会让活人想起死人。" },
    ],
    choices: [
      {
        label: "许诺保护",
        text: "承诺护送他离开码头，交换当年的旧账。",
        effect: { allies: 14, survival: 5, alert: 4 },
        result: "账房终于交出半截账页。上面不是金额，而是一串船名和出海日期。",
      },
      {
        label: "旧约压他",
        text: "把分账旧约拍在他面前，逼他交代当年谁拿走了钱。",
        effect: { prestige: 10, clue: 8, alert: 8 },
        result: "账房被你逼退一步，只说出一条船名，随即警觉地闭了嘴。",
      },
      {
        label: "海图交换",
        text: "只给他看海图一角，问他认不认得这个坐标。",
        effect: { clue: 15, allies: 5, alert: 6 },
        result: "他认出了坐标，却先反问你，那本旧书是不是从木箱里拿的。",
      },
    ],
  },
  {
    presentation: "image",
    backdrop: "./assets/dockside-chest.png",
    title: "夜查木箱",
    speaker: "旁白",
    text: "旧书里的坐标、半截账页和那条船名，终于开始互相对上了。",
    setup: "夜里潮气很重。旧木箱还在原处，锁孔边缘多出了新划痕。",
    prose: [
      "有人比你更早回来过，也许是为了销毁证据，也许是为了确认你到底拿走了什么。",
      "海图、账页、船名，在昏灯下慢慢咬合。你意识到自己找到的不是藏宝图，而是一条被抹掉的航线。",
    ],
    dialogues: [
      { actor: "hero", with: "accountant", text: "锁孔边是新划痕。有人回来过，而且比我更急。" },
      { actor: "accountant", text: "他们不是来找钱，是来确认你拿走了什么。" },
      { actor: "hero", with: "accountant", text: "旧书、账页、船名，终于对上了。" },
    ],
    choices: [
      {
        label: "拼出坐标",
        text: "把海图和账页拼在一起，确认未知海域的位置。",
        effect: { clue: 18, survival: 4, alert: 5 },
        result: "坐标拼上了。那不是藏宝点，而是一条被删掉的航线。",
      },
      {
        label: "去找阿七",
        text: "去找船工阿七，问他愿不愿意陪你夜里出海。",
        effect: { allies: 16, survival: 8, alert: 4 },
        result: "阿七没有立刻答应，只问你一句，如果大伯派人追，你敢不敢不回头。",
      },
      {
        label: "藏起证据",
        text: "把旧书和账页分开藏，只留一份假线索给回来翻箱的人。",
        effect: { survival: 16, clue: 5, alert: -4 },
        result: "半夜果然有人回来过。对方拿走了假线索，而你第一次让大伯扑了空。",
      },
    ],
  },
  {
    presentation: "image",
    backdrop: "./assets/midnight-dock.png",
    title: "码头潮声",
    speaker: "阿七",
    text: "船可以借你，但这趟海不是去找钱，是去找死人没来得及说完的话。",
    setup: "潮水拍在木桩上。阿七把船缆绕了两圈，压低了声音。",
    prose: [
      "远处有人在喊你的名字，但声音很快就被海浪吃掉了。",
      "码头上的每一盏灯都像一只睁开的眼，你知道大伯已经开始动人了。",
    ],
    dialogues: [
      { actor: "aqi", text: "船可以借你，但这趟海不是去找钱。" },
      { actor: "hero", with: "aqi", text: "那是去找什么？" },
      { actor: "aqi", text: "找死人留下的话，也找活人不敢认的债。" },
    ],
    choices: [
      {
        label: "立刻出海",
        text: "趁追兵还没反应过来，带着阿七连夜离港。",
        effect: { survival: 10, clue: 10, alert: 9 },
        result: "小船滑进黑水里。你抢到了时间，也把自己暴露在海面上。",
      },
      {
        label: "放假消息",
        text: "故意让人听见你明早才走，把追兵引向错误码头。",
        effect: { survival: 16, allies: 6, alert: -3 },
        result: "巷口的影子很快散了。有人上钩了，你第一次把大伯的人牵着走。",
      },
      {
        label: "问清旧船",
        text: "逼阿七先说清，那艘旧船为什么会从账本和族谱里一起消失。",
        effect: { clue: 18, prestige: 4, alert: 5 },
        result: "阿七沉默很久，只说出一个名字：沉银号。它不是失踪，是被人故意留在海上。",
      },
    ],
  },
  {
    presentation: "image",
    backdrop: "./assets/black-sea-old-ship.png",
    title: "黑海旧船",
    speaker: "旁白",
    text: "雾散开时，旧船的影子像一座沉在海上的祠堂。",
    setup: "你终于看见短剧结尾之后真正的入口，那艘不该存在的旧船就停在雾里。",
    prose: [
      "海风把灯火吹得忽明忽暗。现在每一种选择，都在决定你是先带回证据，还是先保住命。",
      "这里不再是看戏的位置，而是你真正入局的第一步。",
    ],
    dialogues: [
      { actor: "aqi", text: "看见了吗？沉银号。族里都说它早就没了。" },
      { actor: "hero", with: "aqi", text: "船还在，账就还在。有人只是把它藏进了海雾里。" },
      { actor: "aqi", text: "那你现在要登船，还是先想好怎么活着回来？" },
    ],
    choices: [
      {
        label: "登船搜证",
        text: "带阿七登上旧船，先找能证明当年分账真相的证据。",
        effect: { clue: 22, survival: -4, alert: 8 },
        result: "船舱里有一只被盐蚀烂的账箱，箱底压着当年所有人的手印。",
      },
      {
        label: "点灯示威",
        text: "在甲板点灯，让追来的人都知道你已经找到了这里。",
        effect: { prestige: 20, alert: 16, allies: 5 },
        result: "远处几艘船同时停住。你把暗处的局，硬生生拖到了所有人眼前。",
      },
      {
        label: "剪缆脱身",
        text: "先剪断拖缆，把旧船推离暗礁，保住自己和阿七的退路。",
        effect: { survival: 22, clue: 6, alert: -2 },
        result: "旧船被潮水带开。你没拿到最多证据，但你活着掌握了下一步。",
      },
    ],
  },
];

const state = {
  sourceUrl: "",
  sourceAccepted: false,
  chapterIndex: 0,
  selectedTools: new Set(),
  resolving: false,
  finished: false,
  customOpen: false,
  dialogueStep: 0,
  scores: {
    prestige: 12,
    survival: 18,
    clue: 20,
    allies: 8,
    alert: 10,
  },
};

const incomingSource = readIncomingSource();

const $ = (selector) => document.querySelector(selector);

const els = {
  intake: $("#intakePanel"),
  sourceForm: $("#sourceForm"),
  sourceInput: $("#sourceInput"),
  sourceSubmit: $("#sourceSubmit"),
  video: $("#videoPanel"),
  storyPlayer: $("#storyPlayer"),
  dramaVideo: $("#dramaVideo"),
  swipeGate: $("#swipeGate"),
  loading: $("#loadingPanel"),
  loadingText: $("#loadingText"),
  loadingMeta: $("#loadingMeta"),
  game: $("#gamePanel"),
  nodeIndex: $("#nodeIndex"),
  sceneTitle: $("#sceneTitle"),
  statPrestige: $("#statPrestige"),
  statClue: $("#statClue"),
  statAlert: $("#statAlert"),
  novelPage: $("#novelPage"),
  characterStage: $("#characterStage"),
  leftSprite: $("#leftSprite"),
  rightSprite: $("#rightSprite"),
  toolRow: $("#toolRow"),
  dialogueArea: $(".dialogue-area"),
  speakerName: $("#speakerName"),
  storyText: $("#storyText"),
  resultNote: $("#resultNote"),
  dialogueNext: $("#dialogueNext"),
  choiceGrid: $("#choiceGrid"),
  customForm: $("#customForm"),
  customInput: $("#customInput"),
  advanceBar: $("#advanceBar"),
  toast: $("#toast"),
  sourceKicker: $("#sourceKicker"),
  sourceTitle: $("#sourceTitle"),
  sourceMeta: $("#sourceMeta"),
};

let touchStartY = 0;
let toastTimer = 0;
let advanceTimer = 0;

const audio = {
  clips: null,
};

function readIncomingSource() {
  const params = new URLSearchParams(window.location.search);
  const incomingUrl = ["source", "url", "link"]
    .map((key) => params.get(key)?.trim())
    .find(Boolean) || "";
  return incomingUrl || DEFAULT_SOURCE_URL;
}

function shortenUrl(url) {
  if (url.length <= 42) return url;
  return `${url.slice(0, 24)}...${url.slice(-12)}`;
}

function sourceHostLabel(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return "story-link";
  }
}

function buildSourceThinkingSteps(url) {
  const shortUrl = shortenUrl(url);
  const host = sourceHostLabel(url);
  return [
    `正在校验链接来源 · ${host}`,
    `正在读取剧情入口 · ${shortUrl}`,
    "正在抽取可进入片段...",
    "正在打开故事...",
  ];
}

function sourceMetaText() {
  if (!state.sourceUrl) {
    return "等待接入";
  }
  return `已连接 · ${shortenUrl(state.sourceUrl)}`;
}

function renderSourceChrome() {
  els.sourceKicker.textContent = SOURCE_INFO.kicker;
  els.sourceTitle.textContent = SOURCE_INFO.title;
  els.sourceMeta.textContent = sourceMetaText();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentChapter() {
  return chapters[state.chapterIndex] || chapters.at(-1);
}

function activeDialogue() {
  return null;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function showToast(text) {
  els.toast.textContent = text;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 1600);
}

function ensureAudioClips() {
  if (audio.clips) return;
  audio.clips = {
    tap: createUiAudioClip({ frequencies: [620, 820], duration: 0.06, volume: 0.42 }),
    choice: createUiAudioClip({ frequencies: [540, 720], duration: 0.09, volume: 0.48 }),
    confirm: createUiAudioClip({ frequencies: [480, 760, 960], duration: 0.12, volume: 0.52 }),
  };
}

function createUiAudioClip({ frequencies, duration = 0.1, sampleRate = 22050, volume = 0.45 }) {
  const frameCount = Math.max(1, Math.floor(sampleRate * duration));
  const pcm = new Int16Array(frameCount);
  for (let index = 0; index < frameCount; index += 1) {
    const time = index / sampleRate;
    const progress = index / frameCount;
    const envelope = Math.max(0, 1 - progress) ** 2;
    let sample = 0;
    frequencies.forEach((frequency, toneIndex) => {
      sample += Math.sin(2 * Math.PI * frequency * time) * (1 - toneIndex * 0.18);
    });
    sample /= Math.max(1, frequencies.length);
    pcm[index] = Math.max(-1, Math.min(1, sample * envelope * volume)) * 32767;
  }

  const wavBytes = createWavBytes(pcm, sampleRate);
  const blob = new Blob([wavBytes], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

function createWavBytes(pcm, sampleRate) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  pcm.forEach((sample, index) => {
    view.setInt16(44 + index * 2, sample, true);
  });

  return new Uint8Array(buffer);
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function playUiSound(kind = "tap") {
  ensureAudioClips();
  const src = audio.clips?.[kind] || audio.clips?.tap;
  if (!src) return;
  const sound = new Audio(src);
  sound.volume = 1;
  sound.play().catch(() => {});
  if (navigator.vibrate) {
    navigator.vibrate(kind === "confirm" ? 16 : 10);
  }
}

function uiSoundKind(button) {
  if (
    button.matches(".source-submit") ||
    button.matches(".swipe-gate") ||
    button.matches(".dialogue-next")
  ) {
    return "confirm";
  }
  if (button.matches(".choice-card")) {
    return "choice";
  }
  return "tap";
}

function setPanel(panel) {
  els.intake.hidden = panel !== "intake";
  els.video.hidden = panel !== "video";
  els.loading.hidden = panel !== "loading";
  els.game.hidden = panel !== "game";
}

function resetVideo() {
  els.dramaVideo.pause();
  els.dramaVideo.currentTime = 0;
  els.storyPlayer.classList.remove("is-ended");
  els.swipeGate.hidden = true;
}

function playVideo() {
  resetVideo();
  setPanel("video");
  renderSourceChrome();
  const playPromise = els.dramaVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => showToast("点一下视频即可开始播放。"));
  }
}

function finishVideo() {
  els.storyPlayer.classList.add("is-ended");
  els.swipeGate.hidden = false;
}

function resetRunState() {
  clearTimeout(advanceTimer);
  state.chapterIndex = 0;
  state.selectedTools.clear();
  state.resolving = false;
  state.finished = false;
  state.customOpen = false;
  state.dialogueStep = 0;
  state.scores = {
    prestige: 12,
    survival: 18,
    clue: 20,
    allies: 8,
    alert: 10,
  };
}

async function bootGame() {
  await runLoadingSequence({
    title: "正在进入剧情",
    steps: GAME_LOADING_STEPS,
    stepDuration: 180,
  });
  resetRunState();
  setPanel("game");
  render();
}

async function runLoadingSequence({ title, steps, stepDuration = 1000 }) {
  setPanel("loading");
  els.loadingText.textContent = title;
  for (const step of steps) {
    els.loadingMeta.textContent = step;
    await sleep(stepDuration);
  }
}

function mergeEffects(...effects) {
  return effects.reduce((merged, effect) => {
    Object.entries(effect).forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
    return merged;
  }, {});
}

function selectedToolEffect() {
  return [...state.selectedTools]
    .map((name) => tools.find((tool) => tool.name === name)?.effect || {})
    .reduce((merged, effect) => mergeEffects(merged, effect), {});
}

function applyEffect(effect) {
  Object.entries(effect).forEach(([key, value]) => {
    state.scores[key] = clamp((state.scores[key] || 0) + value);
  });
}

function storyProgress(chapter) {
  return (chapter.prose || [chapter.setup]).join("\n\n");
}

function sceneBrief(chapter) {
  return [chapter.setup, storyProgress(chapter)].filter(Boolean).join("\n\n");
}

function setSpeaker(name) {
  els.speakerName.hidden = false;
  els.dialogueArea.classList.toggle("is-narration", false);
  els.speakerName.textContent = name;
}

function inferCustom(text) {
  if (/海图|坐标|旧书|木箱|真相/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { clue: 12, alert: 5 },
      result: "你选择紧咬线索。旧书、木箱和海上的旧债，被你慢慢连成了一条暗线。",
    };
  }
  if (/认账|威胁|当众|逼/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { prestige: 12, alert: 9, survival: -2 },
      result: "你选择正面施压。场面被你压出裂缝，大伯也开始把你当成真正的威胁。",
    };
  }
  if (/观察|跟踪|站队|看/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { allies: 10, survival: 6 },
      result: "你选择先看人心。谁害怕，谁沉默，谁想帮你，都慢慢浮出了水面。",
    };
  }
  return {
    label: "自由行动",
    text,
    effect: { survival: 10, clue: 4 },
    result: "你保住了主动权。它不一定最锋利，但能让你带着更多底牌往下走。",
  };
}

function resolveChoice(choice) {
  if (state.resolving || state.finished) return;
  const carriedTools = [...state.selectedTools];
  const toolsText = carriedTools.length
    ? `你随身带着${carriedTools.join("、")}，这让你的行动多了一层底气。`
    : "";
  const finalEffect = mergeEffects(choice.effect, selectedToolEffect());
  applyEffect(finalEffect);
  state.resolving = true;
  state.customOpen = false;
  setSpeaker("行动结果");
  els.storyText.textContent = `你决定${choice.label}`;
  els.resultNote.hidden = false;
  els.resultNote.textContent = [choice.text, choice.result, toolsText].filter(Boolean).join("\n\n");
  renderHud();
  renderTools();
  renderChoices();
  renderAdvance();
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(advanceChapter, 2300);
}

function advanceChapter() {
  if (state.chapterIndex >= chapters.length - 1) {
    state.finished = true;
    state.resolving = false;
    setSpeaker("终局回响");
    els.storyText.textContent = "海雾合拢，旧船上的灯还没有熄。";
    els.resultNote.hidden = false;
    els.resultNote.textContent =
      "你已经踏进短剧结尾之后真正的局里。下一阶段可以继续沿着这条航线，把更多分支做成完整关卡。";
    render();
    return;
  }

  state.chapterIndex += 1;
  state.selectedTools.clear();
  state.resolving = false;
  state.customOpen = false;
  state.dialogueStep = 0;
  render();
}

function renderHud() {
  const chapter = currentChapter();
  els.nodeIndex.textContent = `Chapter ${state.chapterIndex + 1}/${chapters.length}`;
  els.sceneTitle.textContent = chapter.title;
  els.statPrestige.textContent = `威望 ${state.scores.prestige}`;
  els.statClue.textContent = `线索 ${state.scores.clue}`;
  els.statAlert.textContent = `危险 ${state.scores.alert}`;
}

function renderPresentation() {
  const chapter = currentChapter();
  els.game.classList.toggle("is-image-act", chapter.presentation === "image");
  els.game.classList.toggle("is-novel-act", chapter.presentation === "novel");
  if (chapter.backdrop) {
    els.game.style.setProperty("--scene-bg", `url("${chapter.backdrop}")`);
  } else {
    els.game.style.removeProperty("--scene-bg");
  }
}

function renderNovelPage() {
  const chapter = currentChapter();
  const paragraphs = chapter.presentation === "novel" ? chapter.prose || [chapter.setup] : [];
  els.novelPage.hidden = !paragraphs.length || state.finished;
  els.novelPage.replaceChildren(
    ...paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );
}

function renderStory() {
  if (state.resolving || state.finished) return;
  const chapter = currentChapter();
  setSpeaker("当前处境");
  els.storyText.textContent = chapter.text;
  els.resultNote.hidden = false;
  els.resultNote.textContent = sceneBrief(chapter);
}

function renderTools() {
  els.toolRow.hidden = state.finished;
  if (els.toolRow.hidden) return;
  els.toolRow.replaceChildren(
    ...tools.map((tool) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = state.selectedTools.has(tool.name) ? "tool-chip is-selected" : "tool-chip";
      button.disabled = state.resolving || state.finished;
      button.textContent = `${tool.name} · ${tool.note}`;
      button.addEventListener("click", () => {
        if (state.selectedTools.has(tool.name)) {
          state.selectedTools.delete(tool.name);
        } else {
          state.selectedTools.add(tool.name);
        }
        renderTools();
      });
      return button;
    }),
  );
}

function renderChoices() {
  els.choiceGrid.hidden = false;
  const chapter = currentChapter();
  const choiceButtons = state.finished
    ? []
    : chapter.choices.map((choice) => {
        const button = document.createElement("button");
        const label = document.createElement("strong");
        const desc = document.createElement("span");
        button.type = "button";
        button.className = "choice-card";
        button.disabled = state.resolving;
        label.textContent = choice.label;
        desc.textContent = choice.text;
        button.append(label, desc);
        button.addEventListener("click", () => resolveChoice(choice));
        return button;
      });

  if (!state.finished) {
    const custom = document.createElement("button");
    custom.type = "button";
    custom.className = "choice-card is-custom";
    custom.disabled = state.resolving;
    custom.innerHTML = "<strong>自由行动</strong><span>写下你自己的做法</span>";
    custom.addEventListener("click", () => {
      state.customOpen = !state.customOpen;
      renderCustom();
    });
    choiceButtons.push(custom);
  }

  els.choiceGrid.replaceChildren(...choiceButtons);
}

function renderCustom() {
  els.customForm.hidden = !state.customOpen || state.resolving || state.finished;
  if (!els.customForm.hidden) {
    els.customInput.focus();
  }
}

function renderCharacters() {
  els.game.classList.add("is-immersive-mode");
  els.game.classList.remove("is-dialogue-mode");
  els.dialogueNext.hidden = true;
  els.characterStage.hidden = true;
  els.leftSprite.removeAttribute("src");
  els.rightSprite.removeAttribute("src");
}

function renderAdvance() {
  els.advanceBar.hidden = !state.resolving || state.finished;
  els.advanceBar.classList.toggle("is-running", state.resolving && !state.finished);
}

function render() {
  renderPresentation();
  renderNovelPage();
  renderHud();
  renderStory();
  renderCharacters();
  renderTools();
  renderChoices();
  renderCustom();
  renderAdvance();
}

function advanceDialogue() {
  return;
}

function enterGame() {
  if (!state.sourceAccepted || els.swipeGate.hidden) return;
  bootGame();
}

function syncSourceToUrl(sourceUrl) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("url", sourceUrl);
  window.history.replaceState({}, "", nextUrl);
}

function acceptSource(rawValue) {
  const sourceUrl = rawValue.trim();
  if (!sourceUrl) {
    showToast("先贴入短剧链接。");
    return;
  }
  state.sourceUrl = sourceUrl;
  state.sourceAccepted = true;
  syncSourceToUrl(sourceUrl);
  runSourceThinking().then(() => {
    playVideo();
  });
}

async function runSourceThinking() {
  await runLoadingSequence({
    title: "正在解析链接",
    steps: buildSourceThinkingSteps(state.sourceUrl),
    stepDuration: 1100,
  });
}

els.dramaVideo.addEventListener("ended", finishVideo);
els.swipeGate.addEventListener("click", enterGame);
els.dialogueNext.addEventListener("click", advanceDialogue);
els.dialogueArea.addEventListener("click", (event) => {
  if (event.target === els.dialogueNext) return;
  advanceDialogue();
});

els.storyPlayer.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0]?.clientY || 0;
});

els.storyPlayer.addEventListener("touchend", (event) => {
  const endY = event.changedTouches[0]?.clientY || touchStartY;
  if (touchStartY - endY > 42) enterGame();
});

els.storyPlayer.addEventListener("wheel", (event) => {
  if (event.deltaY > 24) enterGame();
});

document.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  playUiSound(uiSoundKind(button));
}, true);

els.sourceForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

els.sourceSubmit.addEventListener("click", () => {
  acceptSource(els.sourceInput.value);
});

els.sourceInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    acceptSource(els.sourceInput.value);
  }
});

els.customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.customInput.value.trim();
  if (!text) {
    showToast("先写一句行动。");
    return;
  }
  els.customInput.value = "";
  resolveChoice(inferCustom(text));
});

els.sourceInput.value = incomingSource;
renderSourceChrome();
setPanel("intake");
