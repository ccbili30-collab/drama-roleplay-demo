import { createSession } from "./src/domain/session/session-model.js";
import { activeRoleplayRun } from "./src/domain/roleplay/roleplay-model.js";
import { getSourceChunk } from "./src/domain/roleplay/source-novel.js";
import {
  addRoleplayDeviation,
  buildActiveRoleplayMessages,
  commitRoleplayOutput,
  inferRoleplayDeviationScope,
  startRoleplayRunFromText,
} from "./src/app/roleplay-controller.js";

function lineText(line, characters = {}) {
  const speaker = characters[line.speaker]?.name || "旁白";
  return `${speaker}：${line.text}`;
}

function createDramaSourceText(drama) {
  return drama.scenes
    .flatMap((scene, index) => [
      `第${index + 1}集 ${scene.title}`,
      `场景气氛：${scene.mood}`,
      ...scene.lines.map((line) => lineText(line, drama.characters)),
      `剧情锚点：${scene.anchor}`,
    ])
    .join("\n\n");
}

function createDramaStructurePlan(drama) {
  let paragraphIndex = 0;
  const chapters = drama.scenes.map((scene, index) => {
    const paragraphCount = 3 + scene.lines.length;
    const startParagraphIndex = paragraphIndex;
    const endParagraphIndex = paragraphIndex + paragraphCount - 1;
    paragraphIndex += paragraphCount;
    return {
      title: `第${index + 1}集 ${scene.title}`,
      type: "short-video-scene",
      markerId: "short-video-mainline",
      markerTitle: drama.title,
      startParagraphIndex,
      endParagraphIndex,
      summary: `${scene.title}：${scene.mood}。${scene.anchor}`,
      anchors: [scene.anchor],
      segments: [
        {
          title: scene.title,
          summary: `${scene.title}的短视频剧情片段，保留原剧情功能并允许玩家行动产生偏移。`,
          startParagraphIndex,
          endParagraphIndex,
        },
      ],
    };
  });

  return {
    title: drama.title,
    method: "short-video-structured-demo",
    model: "local-demo-adapter",
    storyMarkers: [{
      id: "short-video-mainline",
      level: "core",
      title: drama.title,
      summary: "短视频主线被整理为跑团 sourceNovel，玩家行动作为 deviation 进入同一套跑团处理链路。",
      startParagraphIndex: 0,
      endParagraphIndex: Math.max(0, paragraphIndex - 1),
      anchors: drama.scenes.map((scene) => scene.anchor),
    }],
    chapters,
  };
}

function activeSourceNovel(session) {
  const run = activeRoleplayRun(session.roleplay);
  return session.roleplay.sourceNovels.find((novel) => novel.id === run?.novelId) || null;
}

function activePosition(session) {
  const run = activeRoleplayRun(session.roleplay);
  const sourceNovel = activeSourceNovel(session);
  const { chapter, chunk } = getSourceChunk(
    sourceNovel,
    run?.currentChapterIndex || 0,
    run?.currentChunkIndex || 0,
  );
  return { run, sourceNovel, chapter, chunk };
}

function compactPromptPreview(messages) {
  const user = messages.find((message) => message.role === "user")?.content || "";
  return user.replace(/\s+/g, " ").slice(0, 180);
}

function localRoleplayOutput({ chapter, chunk, userInstruction = "", tools = [] }) {
  const toolText = tools.length ? `你同时带着${tools.join("、")}，这个选择会影响周围人判断你的底牌。` : "";
  const actionText = userInstruction
    ? `你的行动进入这一段：${userInstruction}。${toolText}`
    : "你暂时不出手，先让宴席上的压力继续发酵。";
  return [
    `【${chapter?.title || "短视频片段"}】`,
    chunk?.rawText || "",
    actionText,
    "旁白只围绕旧约、海图和这片海推进，不跳出短视频留下的冲突。",
  ].filter(Boolean).join("\n");
}

function selectedToolsText(tools = []) {
  return tools.length ? `携带：${tools.join("、")}` : "未携带额外工具";
}

export function createDramaRoleplayRuntime(drama) {
  const session = createSession(`${drama.title} 跑团`, { kind: "roleplay" });
  const text = createDramaSourceText(drama);
  const structurePlan = createDramaStructurePlan(drama);
  startRoleplayRunFromText(session, {
    title: drama.title,
    text,
    structurePlan,
    chunkOptions: {
      targetLength: 120,
      minLength: 40,
      maxLength: 260,
    },
    chapterIndex: 0,
    chunkIndex: 0,
  });
  return { session, text, structurePlan };
}

export function getDramaRoleplaySnapshot(runtime) {
  const { run, sourceNovel, chapter, chunk } = activePosition(runtime.session);
  return {
    run,
    sourceNovel,
    chapter,
    chunk,
    sceneIndex: run?.currentChapterIndex || 0,
    promptMessages: buildActiveRoleplayMessages(runtime.session, { userInstruction: "" }),
  };
}

export function continueDramaRoleplay(runtime) {
  const { chapter, chunk } = activePosition(runtime.session);
  const messages = buildActiveRoleplayMessages(runtime.session, { userInstruction: "继续围绕海上旧约推进。" });
  const outputText = localRoleplayOutput({ chapter, chunk });
  const committed = commitRoleplayOutput(runtime.session, {
    outputText,
    userInstruction: "继续围绕海上旧约推进。",
    advance: true,
  });
  return {
    outputText,
    promptPreview: compactPromptPreview(messages),
    committed,
    snapshot: getDramaRoleplaySnapshot(runtime),
  };
}

export function actInDramaRoleplay(runtime, {
  userText = "",
  tools = [],
} = {}) {
  const instruction = [
    userText,
    selectedToolsText(tools),
  ].filter(Boolean).join("\n");
  const { chapter, chunk, run } = activePosition(runtime.session);
  const messages = buildActiveRoleplayMessages(runtime.session, { userInstruction: instruction });
  const deviation = userText
    ? addRoleplayDeviation(runtime.session, {
      description: instruction,
      scope: inferRoleplayDeviationScope(userText, "chapter"),
      sourceUserMessageId: `demo-${Date.now()}`,
      affectedAnchors: chapter?.anchors?.map((anchor) => anchor.id).filter(Boolean) || [],
      createdAtChapter: run?.currentChapterIndex,
      createdAtChunk: run?.currentChunkIndex,
      recoveryStrategy: "保留短视频结尾的海上旧约冲突，把玩家行动桥接回后续剧情锚点。",
    })
    : null;
  const outputText = localRoleplayOutput({ chapter, chunk, userInstruction: userText, tools });
  const committed = commitRoleplayOutput(runtime.session, {
    outputText,
    userInstruction: instruction,
    createdDeviationIds: deviation ? [deviation.id] : [],
    advance: true,
  });
  return {
    outputText,
    promptPreview: compactPromptPreview(messages),
    deviation,
    committed,
    snapshot: getDramaRoleplaySnapshot(runtime),
  };
}
