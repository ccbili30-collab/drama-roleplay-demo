const loadingSteps = [
  "接上短视频结尾",
  "生成关卡冲突",
  "装载角色成长线",
];

const stats = [
  { key: "prestige", label: "威望" },
  { key: "survival", label: "生存" },
  { key: "clue", label: "线索" },
  { key: "allies", label: "人脉" },
  { key: "alert", label: "大伯警觉" },
];

const player = {
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
};

const characters = {
  gm: { name: "旁白", short: "旁" },
  uncle: { name: "大伯", short: "伯" },
  accountant: { name: "账房", short: "账" },
  deckhand: { name: "船工阿七", short: "七" },
  user: { name: "你", short: "你" },
};

const levels = [
  {
    title: "宴席逼问",
    mood: "压迫 / 海上生存",
    scene: "短视频最后一幕接上：宴席忽然静下来。你刚提到当年那句“赚了钱对半分”，大伯的脸色沉了下去。",
    line: { speaker: "uncle", text: "你怎么在这片海上活下去？" },
    prompt: "这不是闲聊，是第一关的生存判定。你要用一个选择决定自己在这片海上的第一种成长方向。",
    choices: [
      {
        label: "逼他认账",
        action: "我当众逼大伯承认当年赚了钱对半分的约定。",
        effect: { prestige: 14, alert: 12, survival: -4 },
        result: "你没有退。桌边的年轻船工第一次抬头看你，大伯的笑却冷了下来。你赢到一点威望，也把自己推到了明处。",
        unlock: "支线种子：敢跟你站队的人，会从沉默里露头。",
      },
      {
        label: "亮出海图",
        action: "我拿出旧书海图，反问他为什么害怕这片海。",
        effect: { clue: 16, alert: 10, prestige: 4 },
        result: "旧书一露，屋里有几个人同时变了脸。大伯没接你的话，只盯着海图边角的坐标。",
        unlock: "支线种子：未知海域坐标被激活。",
      },
      {
        label: "观察站队",
        action: "我先忍住，观察宴席上谁站在大伯那边。",
        effect: { allies: 12, survival: 8, prestige: -2 },
        result: "你把话咽回去，开始看每个人的手和眼神。账房在听到旧约时摸了一下袖口，那里面可能有账本。",
        unlock: "支线种子：账房成为可接触对象。",
      },
      {
        label: "摔杯离席",
        action: "我直接摔杯离席，回去查旧木箱里的坐标。",
        effect: { survival: 6, clue: 10, alert: 8, allies: -3 },
        result: "杯子碎在地上，你趁乱离开。你保住主动权，但宴席上的人会把你的离场解读成宣战。",
        unlock: "支线种子：夜查木箱提前开启。",
      },
    ],
  },
  {
    title: "账房袖口",
    mood: "人脉 / 旧账",
    scene: "宴席散后，账房从后门离开。他走得很慢，像是在等一个胆子够大的人跟上。",
    line: { speaker: "accountant", text: "当年的账不是不能查，只是查了就没人能装不知道。" },
    prompt: "第二关决定你怎么获得旧账：靠威压、交易、保护，还是继续查海图。",
    choices: [
      {
        label: "许诺保护",
        action: "我告诉账房，只要他说出旧账，我会保证他今晚能安全离开码头。",
        effect: { allies: 14, survival: 5, alert: 4 },
        result: "账房终于把半截账页塞给你。上面不是金额，而是一串船名和出海日期。",
        unlock: "获得：半截账页。",
      },
      {
        label: "拿旧约压他",
        action: "我把分账旧约拍在他面前，让他承认当年谁拿走了钱。",
        effect: { prestige: 10, clue: 8, alert: 8 },
        result: "账房被你逼退一步。他说出一个船名，又立刻闭嘴，因为巷口有人在看。",
        unlock: "获得：沉船船名。",
      },
      {
        label: "用海图交换",
        action: "我只给他看海图的一角，问他是否认得这个坐标。",
        effect: { clue: 15, allies: 5, alert: 6 },
        result: "账房认出了坐标，却先问你旧书是不是从木箱里拿的。他知道的比账本更多。",
        unlock: "获得：坐标见证人。",
      },
      {
        label: "放他走",
        action: "我不逼账房，只记住他离开的路线，先确认有没有人跟踪。",
        effect: { survival: 12, allies: 6, clue: 3 },
        result: "你没有惊动他，反而看见船工阿七替他挡了一次视线。原来沉默的人不止一个。",
        unlock: "获得：阿七的善意。",
      },
    ],
  },
  {
    title: "夜查木箱",
    mood: "线索 / 危险",
    scene: "夜里潮气很重。旧木箱还在原处，锁孔边有新划痕，说明你离席后已经有人来过。",
    line: { speaker: "gm", text: "旧书里的坐标、半截账页和船名开始互相对上。那片海不是传说，是被人藏起来的债。" },
    prompt: "第三关决定主角成长为哪种人：追真相、找盟友、保命，或正面对抗。",
    choices: [
      {
        label: "拼出坐标",
        action: "我把旧书海图和账页拼在一起，优先确认未知海域的位置。",
        effect: { clue: 18, survival: 4, alert: 5 },
        result: "坐标拼上了。那不是藏宝点，而是一条被删掉的航线，终点标着大伯年轻时的船号。",
        unlock: "成长方向：真相追索者。",
      },
      {
        label: "找阿七上船",
        action: "我去找船工阿七，问他愿不愿意陪我出一次夜海。",
        effect: { allies: 16, survival: 8, alert: 4 },
        result: "阿七没有立刻答应，只问你一句：如果大伯派人追，你敢不敢不回头？",
        unlock: "成长方向：结盟生存者。",
      },
      {
        label: "先藏证据",
        action: "我把旧书和账页分开藏，留一份假线索给来翻箱的人。",
        effect: { survival: 16, clue: 5, alert: -4 },
        result: "半夜果然有人来翻箱。他拿走了假线索，而你第一次让大伯的眼线扑空。",
        unlock: "成长方向：谨慎布局者。",
      },
      {
        label: "约大伯码头见",
        action: "我托人传话，让大伯明早码头见，旧约和海图一起算。",
        effect: { prestige: 18, alert: 14, allies: -4 },
        result: "消息传出去后，码头比平时更早亮灯。有人怕你赢，有人等你死。",
        unlock: "成长方向：正面对抗者。",
      },
    ],
  },
];

const state = {
  levelIndex: 0,
  messages: [],
  inventoryOpen: false,
  customOpen: false,
  selectedEquipment: new Set(),
  selectedThisLevel: false,
  finished: false,
  scores: {
    prestige: 12,
    survival: 18,
    clue: 20,
    allies: 8,
    alert: 10,
  },
  flags: [],
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
  statPrestige: $("#statPrestige"),
  statSurvival: $("#statSurvival"),
  statClue: $("#statClue"),
  statAllies: $("#statAllies"),
  statAlert: $("#statAlert"),
  barPrestige: $("#barPrestige"),
  barSurvival: $("#barSurvival"),
  barClue: $("#barClue"),
  barAllies: $("#barAllies"),
  barAlert: $("#barAlert"),
};

let toastTimer = 0;
let touchStartY = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
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

function currentLevel() {
  return levels[state.levelIndex] || levels.at(-1);
}

function character(id) {
  return characters[id] || characters.gm;
}

function pushMessage(type, speaker, text, note = "") {
  state.messages.push({ type, speaker, text, note });
}

function effectText(effect) {
  return Object.entries(effect)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      const label = stats.find((stat) => stat.key === key)?.label || key;
      return `${label}${value > 0 ? "+" : ""}${value}`;
    })
    .join(" / ");
}

function applyEffect(effect) {
  Object.entries(effect).forEach(([key, value]) => {
    state.scores[key] = clampScore((state.scores[key] || 0) + value);
  });
}

function toolEffect(tools) {
  const effect = {};
  if (tools.includes("旧书海图")) effect.clue = 4;
  if (tools.includes("分账旧约")) effect.prestige = 3;
  if (tools.includes("酒杯")) effect.alert = 2;
  if (tools.includes("木箱钥匙")) effect.survival = 3;
  return effect;
}

function mergeEffects(...effects) {
  return effects.reduce((merged, effect) => {
    Object.entries(effect).forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
    return merged;
  }, {});
}

function inferCustomChoice(text) {
  if (/海图|坐标|旧书|木箱|查|真相/.test(text)) {
    return {
      label: "自定义：追线索",
      effect: { clue: 12, alert: 5 },
      result: "你的行动被判定为追线索路线。你没有离开短视频主线，而是把旧书、木箱和海上旧债连得更紧。",
      unlock: "自定义行动归档：线索成长。",
    };
  }
  if (/认账|逼|骂|摔|威胁|当众/.test(text)) {
    return {
      label: "自定义：争威望",
      effect: { prestige: 12, alert: 9, survival: -2 },
      result: "你的行动被判定为争威望路线。场面被你压出一道裂缝，但大伯也会更快把你当成威胁。",
      unlock: "自定义行动归档：威望成长。",
    };
  }
  if (/跟踪|观察|忍|等|看|站队/.test(text)) {
    return {
      label: "自定义：看人脉",
      effect: { allies: 10, survival: 6 },
      result: "你的行动被判定为人脉观察路线。你暂时不赢嘴上那口气，换来的是谁怕谁、谁帮谁的真实站位。",
      unlock: "自定义行动归档：人脉成长。",
    };
  }
  return {
    label: "自定义：保命",
    effect: { survival: 10, clue: 4 },
    result: "你的行动被判定为生存路线。它不一定最爽，但能让主角带着更多底牌走到下一节点。",
    unlock: "自定义行动归档：生存成长。",
  };
}

function addLevelIntro() {
  const level = currentLevel();
  pushMessage("narrator", "gm", level.scene);
  pushMessage("narrator", level.line.speaker, level.line.text);
  pushMessage("narrator", "gm", level.prompt, "选择会改变成长面板，并解锁下一节点的不同优势。");
}

function resetRun() {
  state.levelIndex = 0;
  state.messages = [];
  state.inventoryOpen = false;
  state.customOpen = false;
  state.selectedEquipment.clear();
  state.selectedThisLevel = false;
  state.finished = false;
  state.flags = [];
  state.scores = {
    prestige: 12,
    survival: 18,
    clue: 20,
    allies: 8,
    alert: 10,
  };
  addLevelIntro();
}

function renderHeader() {
  const level = currentLevel();
  els.sceneIndex.textContent = `互动节点 ${state.levelIndex + 1}/${levels.length}`;
  els.sceneTitle.textContent = level.title;
  els.mood.textContent = level.mood;
}

function renderGrowth() {
  stats.forEach((stat) => {
    const value = clampScore(state.scores[stat.key] || 0);
    const valueEl = els[`stat${stat.key[0].toUpperCase()}${stat.key.slice(1)}`];
    const barEl = els[`bar${stat.key[0].toUpperCase()}${stat.key.slice(1)}`];
    valueEl.textContent = String(value);
    barEl.style.width = `${value}%`;
  });
}

function renderStatus() {
  els.statusName.textContent = player.name;
  els.statusRole.textContent = player.role;
  els.statusHp.textContent = String(player.hp);
  els.statusTrust.textContent = String(Math.max(0, Math.min(100, state.scores.allies + state.scores.prestige - state.scores.alert)));
  els.statusClue.textContent = state.flags.at(-1) || player.clue;
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

function renderCustomComposer() {
  els.playForm.hidden = !state.customOpen || state.selectedThisLevel || state.finished;
  if (state.customOpen && !state.selectedThisLevel && !state.finished) {
    els.input.focus();
  }
}

function renderMessages() {
  els.messages.replaceChildren(
    ...state.messages.map((message) => {
      const profile = message.type === "user" ? characters.user : character(message.speaker);
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

function renderChoices() {
  const level = currentLevel();
  const buttons = level.choices.map((choice, index) => {
    const button = document.createElement("button");
    const label = document.createElement("strong");
    const action = document.createElement("span");
    const meta = document.createElement("em");
    button.type = "button";
    button.className = "branch-choice";
    button.disabled = state.selectedThisLevel || state.finished;
    label.textContent = choice.label;
    action.textContent = choice.action;
    meta.textContent = effectText(choice.effect);
    button.append(label, action, meta);
    button.addEventListener("click", () => resolveChoice(choice, choice.action));
    if (index === 0) button.classList.add("is-primary-choice");
    return button;
  });

  const customButton = document.createElement("button");
  const customLabel = document.createElement("strong");
  const customAction = document.createElement("span");
  const customMeta = document.createElement("em");
  customButton.type = "button";
  customButton.className = "branch-choice is-custom-choice";
  customButton.disabled = state.selectedThisLevel || state.finished;
  customLabel.textContent = "自由输入";
  customAction.textContent = "不选预设支线，写下自己的行动。";
  customMeta.textContent = "系统归类成长方向";
  customButton.append(customLabel, customAction, customMeta);
  customButton.addEventListener("click", () => {
    state.customOpen = !state.customOpen;
    render();
  });
  buttons.push(customButton);

  document.querySelector(".quick-row").replaceChildren(...buttons);
  els.next.disabled = !state.selectedThisLevel || state.finished;
  els.next.textContent = state.levelIndex >= levels.length - 1 ? "查看结局" : "下一节点";
}

function render() {
  renderHeader();
  renderGrowth();
  renderStatus();
  renderInventoryPanel();
  renderMessages();
  renderChoices();
  renderCustomComposer();
}

async function bootDemo() {
  setPanel("loading");

  for (const step of loadingSteps) {
    els.loadingText.textContent = `${step}...`;
    await sleep(220);
  }

  resetRun();
  setPanel("game");
  render();
}

function resolveChoice(choice, actionText) {
  if (state.finished) {
    showToast("这一轮关卡已经完成。");
    return;
  }
  if (state.selectedThisLevel) {
    showToast("这一节点已经结算，进入下一节点继续。");
    return;
  }

  const tools = [...state.selectedEquipment];
  const finalEffect = mergeEffects(choice.effect, toolEffect(tools));
  applyEffect(finalEffect);
  if (choice.unlock) state.flags.push(choice.unlock.replace(/^获得：|^支线种子：|^成长方向：|^自定义行动归档：/, ""));
  state.selectedThisLevel = true;
  state.customOpen = false;
  pushMessage("user", "user", actionText, tools.length ? `携带：${tools.join("、")}` : "");
  pushMessage("narrator", "gm", choice.result, `成长结算：${effectText(finalEffect)}\n${choice.unlock}`);
  render();
}

function playerAct(rawText) {
  const text = rawText.trim();
  if (!text) {
    showToast("先输入一句行动。");
    return;
  }
  resolveChoice(inferCustomChoice(text), text);
  els.input.value = "";
}

function nextLevel() {
  if (!state.selectedThisLevel) {
    showToast("先完成这一关的选择。");
    return;
  }

  if (state.levelIndex >= levels.length - 1) {
    const ending = [
      `当前成长：威望 ${state.scores.prestige} / 生存 ${state.scores.survival} / 线索 ${state.scores.clue} / 人脉 ${state.scores.allies} / 警觉 ${state.scores.alert}`,
      "这一版 MVP 到这里停住：不同支线已经改变角色成长，后续可以用这些数值解锁不同短剧片段、可招募角色和出海路线。",
    ].join("\n");
    pushMessage("narrator", "gm", ending, "关卡 Demo 完成");
    state.finished = true;
    render();
    return;
  }

  state.levelIndex += 1;
  state.selectedThisLevel = false;
  state.customOpen = false;
  state.selectedEquipment.clear();
  addLevelIntro();
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

els.next.addEventListener("click", nextLevel);

playStoryPreview();
