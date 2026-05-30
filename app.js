import {
  actInDramaRoleplay,
  continueDramaRoleplay,
  createDramaRoleplayRuntime,
  getDramaRoleplaySnapshot,
} from "./drama-roleplay-adapter.js";

const loadingSteps = [
  "读取短剧 URL",
  "抽出主线剧情",
  "把角色设定写入内部卡片",
  "生成对话跑团",
];

const drama = {
  title: "雨夜替身契约",
  player: {
    name: "林遥",
    role: "替身契约者",
    hp: 72,
    trust: 18,
    clue: "黑伞",
    equipment: [
      { name: "黑伞", note: "沈牧递来的遮蔽物" },
      { name: "旧手机", note: "还能录音和拍照" },
      { name: "合同复印件", note: "契约剧情锚点" },
    ],
  },
  characters: {
    gm: {
      name: "旁白",
      short: "旁",
      card: "只负责把短剧原剧情、玩家行动和下一幕锚点串起来。",
    },
    linyao: {
      name: "林遥",
      short: "遥",
      card: "被迫卷入替身契约的女主，谨慎、缺钱，但很会观察细节。",
    },
    shenmu: {
      name: "沈牧",
      short: "沈",
      card: "提出契约的男主，话少、强势，真实目的被短剧后段揭开。",
    },
    heiqi: {
      name: "黑旗",
      short: "旗",
      card: "老宅晚宴的试探者，负责把伪装剧情推向危机。",
    },
  },
  scenes: [
    {
      title: "雨夜城际站",
      mood: "悬疑 / 初遇",
      status: { hp: 72, trust: 18, clue: "黑伞" },
      anchor: "林遥沉默上车，进入沈家的替身契约。",
      lines: [
        { speaker: "gm", text: "雨声压住了站台广播。最后一班车即将离站，林遥在检票口前停住。" },
        { speaker: "shenmu", text: "跟我走。别让他们看见你。" },
        { speaker: "linyao", text: "你是谁？为什么知道我的名字？" },
      ],
    },
    {
      title: "地下车库",
      mood: "交易 / 压迫",
      status: { hp: 66, trust: 24, clue: "合同复印件" },
      anchor: "契约成立，林遥获得母亲手术费。",
      lines: [
        { speaker: "gm", text: "车库灯一盏盏亮起，合同被推到林遥面前。" },
        { speaker: "shenmu", text: "三天。你只需要像她一样活三天。" },
        { speaker: "linyao", text: "如果我拒绝呢？" },
      ],
    },
    {
      title: "老宅晚宴",
      mood: "伪装 / 试探",
      status: { hp: 54, trust: 37, clue: "后花园旧井" },
      anchor: "林遥差点露馅，沈牧第一次替她圆场。",
      lines: [
        { speaker: "gm", text: "老宅晚宴安静得过分，所有人的目光都落在林遥身上。" },
        { speaker: "heiqi", text: "小姐还记得后花园那口井里，藏着什么吗？" },
        { speaker: "shenmu", text: "她今晚累了。这个问题，我替她答。" },
      ],
    },
    {
      title: "监控室反转",
      mood: "揭露 / 共谋",
      status: { hp: 48, trust: 52, clue: "监控备份" },
      anchor: "身份揭露，二人转入共同调查。",
      lines: [
        { speaker: "gm", text: "监控墙上的画面被一格格放大。林遥终于看见，最早跟踪她的人并不是沈牧。" },
        { speaker: "shenmu", text: "你不是她。但你也不是这场骗局的起点。" },
        { speaker: "linyao", text: "那就别再把我当替身。把真相告诉我。" },
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
  start: $("#startPanel"),
  loading: $("#loadingPanel"),
  game: $("#gamePanel"),
  parseForm: $("#parseForm"),
  loadSample: $("#loadSampleButton"),
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

function appendSourceChunk(snapshot = state.snapshot) {
  if (!snapshot?.chunk) return;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: snapshot.chunk.rawText,
    note: `结构化短视频源：${snapshot.chapter?.title || "当前片段"}`,
  });
}

function renderHeader() {
  const scene = sceneForSnapshot();
  const run = state.snapshot?.run;
  els.sceneIndex.textContent = `Scene ${(run?.currentChapterIndex || 0) + 1}/${drama.scenes.length}`;
  els.sceneTitle.textContent = scene.title;
  els.mood.textContent = `${scene.mood} / 跑团游标 chunk ${(run?.currentChunkIndex || 0) + 1}`;
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

function render() {
  renderHeader();
  renderStatus(sceneForSnapshot());
  renderInventoryPanel();
  renderMessages();
}

async function bootDemo() {
  els.start.hidden = true;
  els.game.hidden = true;
  els.loading.hidden = false;

  for (const step of loadingSteps) {
    els.loadingText.textContent = `${step}...`;
    await sleep(320);
  }

  state.runtime = createDramaRoleplayRuntime(drama);
  state.snapshot = getDramaRoleplaySnapshot(state.runtime);
  state.messages = [];
  state.inventoryOpen = false;
  state.selectedEquipment.clear();
  state.done = false;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: "短视频剧情已转换为跑团 sourceNovel。接下来会复用跑团的结构化文本、剧情锚点、偏移记录和游标推进。",
    note: `sourceNovel：${state.snapshot.sourceNovel?.title || drama.title}`,
  });
  appendSourceChunk();
  els.loading.hidden = true;
  els.game.hidden = false;
  render();
}

function nextLine() {
  if (!state.runtime || state.done) {
    showToast("演示到这里结束。");
    return;
  }

  const wasLast = isLastRoleplayChunk();
  const result = continueDramaRoleplay(state.runtime);
  state.snapshot = result.snapshot;
  state.messages.push({
    type: "narrator",
    speaker: "gm",
    text: result.outputText,
    note: `跑团处理完成。Prompt 预览：${result.promptPreview}`,
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
  const toolText = tools.length ? `携带工具：${tools.join("、")}` : "未携带额外工具";
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
    note: [
      result.deviation ? `偏移已进入跑团 deviation：${result.deviation.scope}` : "",
      `Prompt 预览：${result.promptPreview}`,
    ].filter(Boolean).join("\n"),
  });
  const scene = sceneForSnapshot();
  els.statusTrust.textContent = Math.min((scene.status?.trust || drama.player.trust) + 6, 100);
  els.statusClue.textContent = tools[0] || scene.status?.clue || "新偏移线索";
  els.input.value = "";
  state.done = wasLast;
  if (!state.done) appendSourceChunk();
  render();
}

els.parseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  bootDemo();
});

els.loadSample.addEventListener("click", bootDemo);

els.playForm.addEventListener("submit", (event) => {
  event.preventDefault();
  playerAct(els.input.value);
});

els.toggleInventory.addEventListener("click", () => {
  state.inventoryOpen = !state.inventoryOpen;
  renderInventoryPanel();
});

els.next.addEventListener("click", nextLine);

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    els.input.value = button.dataset.choice || "";
    els.input.focus();
  });
});
