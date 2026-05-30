const loadingSteps = [
  "接上短视频结尾",
  "装入角色状态",
  "生成互动选项",
];

const tools = [
  { name: "旧书海图", effect: { clue: 4 }, note: "强化线索" },
  { name: "分账旧约", effect: { prestige: 3 }, note: "强化威望" },
  { name: "木箱钥匙", effect: { survival: 3 }, note: "强化生存" },
];

const chapters = [
  {
    presentation: "image",
    title: "宴席逼问",
    speaker: "大伯",
    text: "你怎么在这片海上活下去？",
    setup: "宴席忽然静下来。你刚提到当年“赚了钱对半分”的旧约，所有人都看向大伯。",
    choices: [
      {
        label: "逼他认账",
        text: "当众逼大伯承认当年的分账约定。",
        effect: { prestige: 14, alert: 12, survival: -4 },
        result: "你没有退。桌边的年轻船工第一次抬头看你，大伯的笑却冷了下来。",
      },
      {
        label: "亮出海图",
        text: "拿出旧书海图，反问他为什么害怕这片海。",
        effect: { clue: 16, alert: 10, prestige: 4 },
        result: "旧书一露，屋里有几个人同时变了脸。大伯只盯着海图边角的坐标。",
      },
      {
        label: "观察站队",
        text: "先忍住，观察宴席上谁站在大伯那边。",
        effect: { allies: 12, survival: 8, prestige: -2 },
        result: "你把话咽回去，开始看每个人的眼神。账房摸了一下袖口。",
      },
    ],
  },
  {
    presentation: "novel",
    title: "账房袖口",
    speaker: "账房",
    text: "当年的账不是不能查，只是查了就没人能装不知道。",
    setup: "宴席散后，账房从后门离开。他走得很慢，像是在等一个胆子够大的人跟上。",
    prose: [
      "宴席后的风从后门灌进来，酒气被吹散，剩下的是木桌上没擦干净的油光。",
      "账房没有回头。他把袖口攥得很紧，像攥着一张会要命的纸。你跟上去时，码头远处的灯一盏盏暗下去。",
      "他终于停在墙影里，说当年的账不是不能查，只是查了之后，没人能继续装作自己干净。",
    ],
    choices: [
      {
        label: "许诺保护",
        text: "告诉账房，只要他说出旧账，你会保证他今晚能离开码头。",
        effect: { allies: 14, survival: 5, alert: 4 },
        result: "账房终于把半截账页塞给你。上面不是金额，而是一串船名和出海日期。",
      },
      {
        label: "旧约压他",
        text: "把分账旧约拍在他面前，让他承认当年谁拿走了钱。",
        effect: { prestige: 10, clue: 8, alert: 8 },
        result: "账房被你逼退一步。他说出一个船名，又立刻闭嘴，因为巷口有人在看。",
      },
      {
        label: "海图交换",
        text: "只给他看海图一角，问他是否认得这个坐标。",
        effect: { clue: 15, allies: 5, alert: 6 },
        result: "账房认出了坐标，却先问你旧书是不是从木箱里拿的。",
      },
    ],
  },
  {
    presentation: "novel",
    title: "夜查木箱",
    speaker: "旁白",
    text: "旧书里的坐标、半截账页和船名开始互相对上。",
    setup: "夜里潮气很重。旧木箱还在原处，锁孔边有新划痕，说明已经有人来过。",
    prose: [
      "夜潮压着码头，木板缝里全是盐和湿气。那只旧木箱还摆在原处，像一张一直没有合上的嘴。",
      "锁孔边多了新划痕。有人比你更早回来过，也许是为了销毁证据，也许是为了确认你到底拿走了什么。",
      "旧书、账页、船名，在昏灯下慢慢互相咬合。你意识到自己找到的不是藏宝图，而是一条被人从记忆里删掉的航线。",
    ],
    choices: [
      {
        label: "拼出坐标",
        text: "把旧书海图和账页拼在一起，确认未知海域的位置。",
        effect: { clue: 18, survival: 4, alert: 5 },
        result: "坐标拼上了。那不是藏宝点，而是一条被删掉的航线。",
      },
      {
        label: "找阿七上船",
        text: "去找船工阿七，问他愿不愿意陪你出一次夜海。",
        effect: { allies: 16, survival: 8, alert: 4 },
        result: "阿七没有立刻答应，只问你：如果大伯派人追，你敢不敢不回头？",
      },
      {
        label: "藏起证据",
        text: "把旧书和账页分开藏，留一份假线索给来翻箱的人。",
        effect: { survival: 16, clue: 5, alert: -4 },
        result: "半夜果然有人来翻箱。他拿走了假线索，而你第一次让大伯的眼线扑空。",
      },
    ],
  },
  {
    presentation: "novel",
    title: "码头潮声",
    speaker: "阿七",
    text: "船可以借你，但这趟海不是去找钱，是去找死人留下的话。",
    setup: "潮水拍在木桩上。阿七把船绳绕了两圈，声音压得很低。你知道他已经站到你这边，但他还在等你给出一个方向。",
    prose: [
      "阿七把船绳绕了两圈，又松开一圈。他不看你，只看潮水，像是在判断这片海今晚会不会收人。",
      "你听见远处有人喊你的名字，但声音很快被浪吞掉。大伯的人已经动了，码头上的每一盏灯都像一只睁开的眼。",
      "阿七说船可以借你，但这趟海不是去找钱。那艘旧船上留下的，是死人没来得及说完的话。",
    ],
    choices: [
      {
        label: "立刻出海",
        text: "趁大伯的人还没反应过来，带着阿七连夜离港。",
        effect: { survival: 10, clue: 10, alert: 9 },
        result: "小船滑进黑水里。你抢到了时间，也把自己暴露在了海面上。",
      },
      {
        label: "放假消息",
        text: "故意让人听见你明早才走，把追兵引向错误的码头。",
        effect: { survival: 16, allies: 6, alert: -3 },
        result: "巷口的影子很快消失。有人上钩了，你第一次把大伯的人牵着走。",
      },
      {
        label: "问清旧船",
        text: "先逼阿七说出那艘旧船为什么从族谱和账本里一起消失。",
        effect: { clue: 18, prestige: 4, alert: 5 },
        result: "阿七沉默很久，说出一个名字：沉银号。它不是失踪，是被人故意留在海上。",
      },
    ],
  },
  {
    presentation: "image",
    title: "黑海旧船",
    speaker: "旁白",
    text: "雾散开时，旧船的影子像一座沉在海面上的祠堂。",
    setup: "你终于看见短视频结尾之后真正的入口。大伯要你在这片海上活下去，而答案就在那艘不该存在的旧船里。",
    choices: [
      {
        label: "登船搜证",
        text: "带阿七登上旧船，先找能证明当年分账真相的东西。",
        effect: { clue: 22, survival: -4, alert: 8 },
        result: "船舱里有一只被盐蚀烂的账箱。箱底压着当年所有人的手印。",
      },
      {
        label: "点灯示威",
        text: "在旧船甲板点灯，让追来的人都知道你已经找到这里。",
        effect: { prestige: 20, alert: 16, allies: 5 },
        result: "远处几艘船同时停住。你把暗处的局，硬生生拖到了所有人眼前。",
      },
      {
        label: "割绳脱身",
        text: "先割断拖缆，把旧船推离暗礁，保住自己和阿七的退路。",
        effect: { survival: 22, clue: 6, alert: -2 },
        result: "旧船被潮水带开。你没拿到最多证据，但你活着掌握了下一步。",
      },
    ],
  },
];

const state = {
  chapterIndex: 0,
  selectedTools: new Set(),
  resolving: false,
  finished: false,
  customOpen: false,
  scores: {
    prestige: 12,
    survival: 18,
    clue: 20,
    allies: 8,
    alert: 10,
  },
};

const $ = (selector) => document.querySelector(selector);

const els = {
  video: $("#videoPanel"),
  storyPlayer: $("#storyPlayer"),
  dramaVideo: $("#dramaVideo"),
  swipeGate: $("#swipeGate"),
  loading: $("#loadingPanel"),
  loadingText: $("#loadingText"),
  game: $("#gamePanel"),
  nodeIndex: $("#nodeIndex"),
  sceneTitle: $("#sceneTitle"),
  statPrestige: $("#statPrestige"),
  statClue: $("#statClue"),
  statAlert: $("#statAlert"),
  novelPage: $("#novelPage"),
  toolRow: $("#toolRow"),
  speakerName: $("#speakerName"),
  storyText: $("#storyText"),
  resultNote: $("#resultNote"),
  choiceGrid: $("#choiceGrid"),
  customForm: $("#customForm"),
  customInput: $("#customInput"),
  advanceBar: $("#advanceBar"),
  toast: $("#toast"),
};

let touchStartY = 0;
let toastTimer = 0;
let advanceTimer = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentChapter() {
  return chapters[state.chapterIndex] || chapters.at(-1);
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

function setPanel(panel) {
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
  const playPromise = els.dramaVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => showToast("点一下视频即可开始播放。"));
  }
}

function finishVideo() {
  els.storyPlayer.classList.add("is-ended");
  els.swipeGate.hidden = false;
}

async function bootGame() {
  setPanel("loading");
  for (const step of loadingSteps) {
    els.loadingText.textContent = `${step}...`;
    await sleep(180);
  }

  clearTimeout(advanceTimer);
  state.chapterIndex = 0;
  state.selectedTools.clear();
  state.resolving = false;
  state.finished = false;
  state.customOpen = false;
  state.scores = { prestige: 12, survival: 18, clue: 20, allies: 8, alert: 10 };
  setPanel("game");
  render();
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

function effectText(effect) {
  const labels = {
    prestige: "威望",
    survival: "生存",
    clue: "线索",
    allies: "人脉",
    alert: "危险",
  };
  return Object.entries(effect)
    .filter(([, value]) => value)
    .map(([key, value]) => `${labels[key] || key}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
}

function applyEffect(effect) {
  Object.entries(effect).forEach(([key, value]) => {
    state.scores[key] = clamp((state.scores[key] || 0) + value);
  });
}

function inferCustom(text) {
  if (/海图|坐标|旧书|木箱|查|真相/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { clue: 12, alert: 5 },
      result: "你选择追索线索。旧书、木箱和海上旧债被你连成了一条暗线。",
    };
  }
  if (/认账|逼|摔|威胁|当众/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { prestige: 12, alert: 9, survival: -2 },
      result: "你选择正面施压。场面被你压出裂缝，大伯也开始真正把你当作威胁。",
    };
  }
  if (/观察|跟踪|忍|等|站队|看/.test(text)) {
    return {
      label: "自由行动",
      text,
      effect: { allies: 10, survival: 6 },
      result: "你选择观察人心。谁害怕、谁沉默、谁想帮你，都开始浮出水面。",
    };
  }
  return {
    label: "自由行动",
    text,
    effect: { survival: 10, clue: 4 },
    result: "你选择保住主动权。它不一定最锋利，但能让你带着更多底牌走下去。",
  };
}

function resolveChoice(choice) {
  if (state.resolving || state.finished) return;
  const toolsText = [...state.selectedTools].length ? `携带：${[...state.selectedTools].join("、")}` : "";
  const finalEffect = mergeEffects(choice.effect, selectedToolEffect());
  applyEffect(finalEffect);
  state.resolving = true;
  state.customOpen = false;
  els.speakerName.textContent = "你的行动";
  els.storyText.textContent = choice.text;
  els.resultNote.hidden = false;
  els.resultNote.textContent = `${choice.result}\n${effectText(finalEffect)}${toolsText ? `\n${toolsText}` : ""}`;
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
    els.speakerName.textContent = "本轮结局";
    els.storyText.textContent = `威望 ${state.scores.prestige} / 线索 ${state.scores.clue} / 危险 ${state.scores.alert}`;
    els.resultNote.hidden = false;
    els.resultNote.textContent = "这一版演示到这里停住。下一步可以把不同数值接到不同短剧片段。";
    render();
    return;
  }

  state.chapterIndex += 1;
  state.selectedTools.clear();
  state.resolving = false;
  state.customOpen = false;
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
  els.speakerName.textContent = chapter.speaker;
  els.storyText.textContent = chapter.text;
  els.resultNote.hidden = false;
  els.resultNote.textContent = chapter.setup;
}

function renderTools() {
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
  const chapter = currentChapter();
  const choiceButtons = state.finished ? [] : chapter.choices.map((choice) => {
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
    custom.innerHTML = "<strong>自由行动</strong><span>写下自己的做法</span>";
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
  if (!els.customForm.hidden) els.customInput.focus();
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
  renderTools();
  renderChoices();
  renderCustom();
  renderAdvance();
}

function enterGame() {
  if (els.swipeGate.hidden) return;
  bootGame();
}

els.dramaVideo.addEventListener("ended", finishVideo);
els.swipeGate.addEventListener("click", enterGame);

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

playVideo();
