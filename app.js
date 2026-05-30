import {
  actInDramaRoleplay,
  continueDramaRoleplay,
  createDramaRoleplayRuntime,
  getDramaRoleplaySnapshot,
} from "./drama-roleplay-adapter.js";

const loadingSteps = [
  "接上短视频结尾",
  "整理旧书海图与分账旧债",
  "打开跑团游标",
];

const choices = [
  {
    label: "逼他认账",
    text: "我当众逼大伯承认当年赚了钱对半分的约定。",
  },
  {
    label: "亮出海图",
    text: "我拿出旧书海图，反问他为什么害怕这片海。",
  },
  {
    label: "观察站队",
    text: "我先忍住，观察宴席上谁站在大伯那边。",
  },
  {
    label: "摔杯离席",
    text: "我直接摔杯离席，回去查旧木箱里的坐标。",
  },
];

const drama = {
  title: "海上旧约",
  player: {
    name: "你",
    role: "被大伯逼问的年轻船民",
    hp: 68,
    trust: 16,
    clue: "旧书海图",
    equipment: [
      { name: "旧书海图", note: "木箱里翻出的坐标线索" },
      { name: "分账旧约", note: "大伯亲口说过赚了钱对半分" },
      { name: "酒杯", note: "宴席上能打断局面的东西" },
      { name: "木箱钥匙", note: "还能回去继续查旧箱" },
    ],
  },
  characters: {
    gm: {
      name: "旁白",
      short: "旁",
      card: "只负责承接短视频结尾，把玩家行动接回海上旧约主线。",
    },
    player: {
      name: "你",
      short: "你",
      card: "跟着大伯在海上做事多年，刚发现旧木箱、旧书和海图坐标。",
    },
    uncle: {
      name: "大伯",
      short: "伯",
      card: "掌着船、人脉和旧账的人，用海上的生存规则压住你。",
    },
    accountant: {
      name: "账房",
      short: "账",
      card: "宴席边缘的沉默旁观者，知道钱到底怎么分过。",
    },
  },
  scenes: [
    {
      title: "宴席逼问",
      mood: "压迫 / 海上生存",
      status: { hp: 68, trust: 16, clue: "旧书海图" },
      anchor: "短视频停在大伯的逼问：你怎么在这片海上活下去？",
      lines: [
        { speaker: "gm", text: "宴席上的杯盏声停了。你刚说出当年“赚了钱对半分”的旧约，所有人都看向大伯。" },
        { speaker: "uncle", text: "我跟你干了这么久，你真以为一句旧话就能分走海上的钱？" },
        { speaker: "uncle", text: "你怎么在这片海上活下去？" },
      ],
    },
    {
      title: "旧账当场",
      mood: "对峙 / 站队",
      status: { hp: 62, trust: 24, clue: "分账旧约" },
      anchor: "你必须判断是当场逼大伯认账，还是先找到宴席里愿意开口的人。",
      lines: [
        { speaker: "gm", text: "屋里有人低头，有人看热闹，账房把手缩进袖口，像是怕你点他的名。" },
        { speaker: "accountant", text: "当年的账……不是不能查，只是查了就没人能装不知道。" },
      ],
    },
    {
      title: "海图坐标",
      mood: "线索 / 危险",
      status: { hp: 58, trust: 30, clue: "未知海域坐标" },
      anchor: "旧书里的海图坐标说明，这场分账旧债背后还有一片被故意藏起来的海。",
      lines: [
        { speaker: "gm", text: "你想起旧木箱里的书。那几行坐标不像藏宝，更像有人不敢让下一代靠近。" },
        { speaker: "uncle", text: "别拿那本破书说事。那片海，吞过的人比你见过的船还多。" },
      ],
    },
    {
      title: "出海前夜",
      mood: "选择 / 开局",
      status: { hp: 55, trust: 36, clue: "出海名单" },
      anchor: "你要决定用旧约逼钱、用海图找真相，还是先保命活过下一次出海。",
      lines: [
        { speaker: "gm", text: "夜色压到码头，船灯一盏盏亮起。你的选择会决定谁敢跟你站到同一条船上。" },
      ],
    },
  ],
};

const state = {
  runtime: null,
  snapshot: null,
  messages: [],
  inventoryOpen: false,
  selectedEquipment: new Set(),
  done: false,
};

const $ = (selector) => document.querySelector(selector);

const els = {
  video: $("#videoPanel"),
  storyPlayer: $("#storyPlayer"),
  dramaVideo: $("#dramaVideo"),
  swipeGate: $("#swipeGate"),
  loading: $("#loadingPanel"),
  game: $("#gamePanel"),
  loadingText: $("#loadingText"),
  sceneIndex: $("#sceneIndex"),
  sceneTitle: $("#sceneTitle"),
  mood: $("#sceneMood"),
  messages: $("#messageList"),
  inventoryPanel: $("#inventoryPanel"),
  toggleInventory: $("#toggleInventoryButton"),
  statusName: $("#statusName"),
  statusRole: $("#statusRole"),
  statusHp: $("#statusHp"),
  statusTrust: $("#statusTrust"),
  statusClue: $("#statusClue"),
  equipmentList: $("#equipmentList"),
  playForm: $("#playForm"),
  input: $("#playerInput"),
  next: $("#nextLineButton"),
  toast: $("#toast"),
};

let toastTimer = 0;
let touchStartY = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showToast(text) {
  els.toast.textContent = text;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
}

function setPanel(panel) {
  els.video.hidden = panel !== "video";
  els.loading.hidden = panel !== "loading";
  els.game.hidden = panel !== "game";
}

function resetStoryPlayer() {
  els.dramaVideo.pause();
  els.dramaVideo.currentTime = 0;
  els.storyPlayer.classList.remove("is-ended");
  els.swipeGate.hidden = true;
}

function finishStoryPlayer() {
  els.storyPlayer.classList.add("is-ended");
  els.swipeGate.hidden = false;
}

function playStoryPreview() {
  resetStoryPlayer();
  setPanel("video");
  const playPromise = els.dramaVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      showToast("点一下视频即可开始播放。");
    });
  }
}

function character(id) {
  return drama.characters[id] || drama.characters.gm;
}

function sceneForSnapshot(snapshot = state.snapshot) {
  return drama.scenes[snapshot?.sceneIndex || 0] || drama.scenes[0];
}

function isLastRoleplayChunk(snapshot = state.snapshot) {
  const chapters = snapshot?.sourceNovel?.chapters || [];
  const run = snapshot?.run;
  if (!run || !chapters.length) return false;
  const chapter = chapters[run.currentChapterIndex];
  const chunkCount = chapter?.chunks?.length || 0;
  return run.currentChapterIndex >= chapters.length - 1
    && run.currentChunkIndex >= Math.max(0, chunkCount - 1);
}

function choicePrompt() {
  return [
    "你可以直接选一个行动，也可以在输入框写自己的做法：",
    ...choices.map((choice, index) => `${index + 1}. ${choice.text}`),
  ].join("\n");
}

function appendOpeningBeat() {
  state.messages.push(
    {
      type: "narrator",
      speaker: "gm",
      text: "短视频最后一幕接上：宴席忽然静下来。你刚提到当年那句“赚了钱对半分”，大伯的脸色沉了下去。",
    },
    {
      type: "narrator",
      speaker: "uncle",
      text: "你怎么在这片海上活下去？",
    },
    {
      type: "narrator",
      speaker: "gm",
      text: choicePrompt(),
    },
  );
}

function appendSourceChunk(snapshot = state.snapshot) {
  if (!snapshot?.chunk) return;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: snapshot.chunk.rawText,
  });
}

function renderHeader() {
  const scene = sceneForSnapshot();
  const run = state.snapshot?.run;
  els.sceneIndex.textContent = `Scene ${(run?.currentChapterIndex || 0) + 1}/${drama.scenes.length}`;
  els.sceneTitle.textContent = scene.title;
  els.mood.textContent = scene.mood;
}

function renderStatus(scene) {
  const player = drama.player;
  const status = scene.status || {};
  els.statusName.textContent = player.name;
  els.statusRole.textContent = player.role;
  els.statusHp.textContent = status.hp ?? player.hp;
  els.statusTrust.textContent = status.trust ?? player.trust;
  els.statusClue.textContent = status.clue || player.clue;
  els.equipmentList.replaceChildren(
    ...player.equipment.map((item) => {
      const card = document.createElement("label");
      const checkbox = document.createElement("input");
      const name = document.createElement("strong");
      const note = document.createElement("span");
      card.className = "equipment-option";
      checkbox.type = "checkbox";
      checkbox.checked = state.selectedEquipment.has(item.name);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedEquipment.add(item.name);
        } else {
          state.selectedEquipment.delete(item.name);
        }
      });
      name.textContent = item.name;
      note.textContent = item.note;
      card.append(checkbox, name, note);
      return card;
    }),
  );
}

function renderInventoryPanel() {
  els.inventoryPanel.hidden = !state.inventoryOpen;
  els.toggleInventory.setAttribute("aria-expanded", String(state.inventoryOpen));
}

function renderMessages() {
  els.messages.replaceChildren(
    ...state.messages.map((message) => {
      const profile = message.type === "user" ? { name: "你", short: "你" } : character(message.speaker);
      const row = document.createElement("article");
      const avatar = document.createElement("span");
      const wrap = document.createElement("div");
      const speaker = document.createElement("span");
      const bubble = document.createElement("div");
      row.className = `message is-${message.type}`;
      avatar.className = "avatar";
      avatar.textContent = profile.short;
      wrap.className = "bubble-wrap";
      speaker.className = "speaker";
      speaker.textContent = profile.name;
      bubble.className = "bubble";
      bubble.textContent = message.text;
      wrap.append(speaker, bubble);
      if (message.note) {
        const note = document.createElement("div");
        note.className = "branch-note";
        note.textContent = message.note;
        wrap.append(note);
      }
      if (message.type === "user") {
        row.append(wrap, avatar);
      } else {
        row.append(avatar, wrap);
      }
      return row;
    }),
  );
  els.messages.scrollTop = els.messages.scrollHeight;
}

function renderQuickChoices() {
  document.querySelectorAll("[data-choice]").forEach((button, index) => {
    const choice = choices[index];
    if (!choice) return;
    button.textContent = choice.label;
    button.dataset.choice = choice.text;
  });
}

function render() {
  renderHeader();
  renderStatus(sceneForSnapshot());
  renderInventoryPanel();
  renderMessages();
}

async function bootDemo() {
  setPanel("loading");

  for (const step of loadingSteps) {
    els.loadingText.textContent = `${step}...`;
    await sleep(220);
  }

  state.runtime = createDramaRoleplayRuntime(drama);
  state.snapshot = getDramaRoleplaySnapshot(state.runtime);
  state.messages = [];
  state.inventoryOpen = false;
  state.selectedEquipment.clear();
  state.done = false;
  appendOpeningBeat();
  setPanel("game");
  render();
}

function nextLine() {
  if (!state.runtime || state.done) {
    showToast("这一段演示到这里结束。");
    return;
  }

  const wasLast = isLastRoleplayChunk();
  const result = continueDramaRoleplay(state.runtime);
  state.snapshot = result.snapshot;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: result.outputText,
  });
  state.done = wasLast;
  if (!state.done) appendSourceChunk();
  render();
}

function playerAct(rawText) {
  const text = rawText.trim();
  if (!text) {
    showToast("先输入一句行动。");
    return;
  }

  const tools = [...state.selectedEquipment];
  const toolText = tools.length ? `携带：${tools.join("、")}` : "";
  state.messages.push({
    type: "user",
    speaker: "user",
    text,
    note: toolText,
  });
  const result = actInDramaRoleplay(state.runtime, {
    userText: text,
    tools,
  });
  state.snapshot = result.snapshot;
  const wasLast = result.committed
    ? result.committed.run.currentChapterIndex === state.snapshot.run.currentChapterIndex
      && result.committed.run.currentChunkIndex === state.snapshot.run.currentChunkIndex
      && isLastRoleplayChunk()
    : false;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: result.outputText,
  });
  const scene = sceneForSnapshot();
  els.statusTrust.textContent = Math.min((scene.status?.trust || drama.player.trust) + 6, 100);
  els.statusClue.textContent = tools[0] || scene.status?.clue || "新的行动后果";
  els.input.value = "";
  state.done = wasLast;
  if (!state.done) appendSourceChunk();
  render();
}

function enterRoleplay() {
  if (els.swipeGate.hidden) return;
  bootDemo();
}

els.dramaVideo.addEventListener("ended", finishStoryPlayer);

els.swipeGate.addEventListener("click", enterRoleplay);

els.storyPlayer.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0]?.clientY || 0;
});

els.storyPlayer.addEventListener("touchend", (event) => {
  const endY = event.changedTouches[0]?.clientY || touchStartY;
  if (touchStartY - endY > 42) enterRoleplay();
});

els.storyPlayer.addEventListener("wheel", (event) => {
  if (event.deltaY > 24) enterRoleplay();
});

els.playForm.addEventListener("submit", (event) => {
  event.preventDefault();
  playerAct(els.input.value);
});

els.toggleInventory.addEventListener("click", () => {
  state.inventoryOpen = !state.inventoryOpen;
  renderInventoryPanel();
});

els.next.addEventListener("click", nextLine);

renderQuickChoices();

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    els.input.value = button.dataset.choice || "";
    els.input.focus();
  });
});

playStoryPreview();
