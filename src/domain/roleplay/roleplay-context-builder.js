import { clean } from "../../utils/text.js";
import { getSourceChunk } from "./source-novel.js";

function section(title, body) {
  const value = clean(body);
  return value ? `[${title}]\n${value}` : "";
}

function listSection(title, items = [], renderItem = (item) => item) {
  const lines = items.map(renderItem).map(clean).filter(Boolean);
  return lines.length ? section(title, lines.join("\n")) : "";
}

export function selectActiveDeviations(deviations = [], ids = []) {
  const idSet = new Set(ids.filter(Boolean));
  return deviations.filter((deviation) => {
    if (!deviation || deviation.status === "abandoned" || deviation.status === "resolved") return false;
    return !idSet.size || idSet.has(deviation.id) || deviation.scope === "global" || deviation.scope === "arc";
  });
}

export function selectMainlineAnchors(sourceNovel, {
  chapterIndex = 0,
  windowSize = 100000,
} = {}) {
  const chapters = sourceNovel?.chapters || [];
  const anchors = [];
  let length = 0;
  for (let index = Math.max(0, chapterIndex); index < chapters.length; index += 1) {
    const chapter = chapters[index];
    const chapterLength = clean(chapter.rawText).length
      || (chapter.chunks || []).reduce((sum, chunk) => sum + clean(chunk.rawText).length, 0);
    length += chapterLength;
    (chapter.anchors || [])
      .filter((anchor) => !["fulfilled", "abandoned"].includes(anchor.status))
      .forEach((anchor) => anchors.push({
        ...anchor,
        chapterTitle: chapter.title,
        chapterIndex: index,
      }));
    if (length >= windowSize) break;
  }
  return anchors;
}

export function buildRoleplayTaskBlock({
  run,
  sourceNovel,
  deviations = [],
  changePool = [],
  userInstruction = "",
  recentSegments = [],
  retrievedCards = [],
} = {}) {
  const { chapter, chunk } = getSourceChunk(
    sourceNovel,
    run?.currentChapterIndex || 0,
    run?.currentChunkIndex || 0,
  );
  const activeDeviations = selectActiveDeviations(deviations, run?.deviationIds || []);
  const anchors = selectMainlineAnchors(sourceNovel, {
    chapterIndex: run?.currentChapterIndex || 0,
    windowSize: run?.mainlineWindowSize,
  });

  const parts = [
    "You are executing TBird's roleplay mode. This is the novel-track roleplay flow: the source novel is the track, user choices are deviations, and the mainline anchors keep the run from drifting aimlessly.",
    "Return only adapted Chinese novel prose for the reader. Do not return analysis, reports, JSON, headings, or system explanations.",
    "Preserve the story function of the source excerpt rather than copying it verbatim. Long-lived user choices must not be silently reverted; bridge them back to the mainline with substitute paths.",
    "Global or arc-level deviations are hard continuity facts. If they conflict with source pronouns, identity, relationships, or scene logic, rewrite the local passage to obey the deviation while preserving the source plot function.",
    section("Current Novel", sourceNovel?.title),
    section("Current Position", chapter ? `${chapter.title || `Chapter ${(run?.currentChapterIndex || 0) + 1}`} / chunk ${(run?.currentChunkIndex || 0) + 1}` : ""),
    section("Source Excerpt", chunk?.rawText),
    section("Source Chunk Summary", chunk?.summary),
    section("Chapter Summary", chapter?.summary),
    listSection("Recent Roleplay Summaries", recentSegments.slice(-6), (segment) => `- ${segment.summary || clean(segment.outputText).slice(0, 240)}`),
    listSection("Active Deviations", activeDeviations, (deviation) => {
      const strategy = clean(deviation.recoveryStrategy) ? `; bridge strategy: ${deviation.recoveryStrategy}` : "";
      const scope = clean(deviation.scope) || "chapter";
      return `- [${scope}] ${deviation.description}${strategy}`;
    }),
    listSection("Change Pool", changePool.slice(-10), (change) => {
      const title = clean(change.chapterTitle) || `Chapter ${(Number(change.chapterIndex) || 0) + 1}`;
      return `- ${title}: ${change.summary}`;
    }),
    listSection("Future Mainline Anchors", anchors.slice(0, 16), (anchor) => {
      const importance = anchor.importance ? `/${anchor.importance}` : "";
      return `- ${anchor.chapterTitle || ""}${importance}: ${anchor.storyFunction || anchor.description || ""}`;
    }),
    listSection("Retrieved Cards", retrievedCards, (card) => `- ${card.title || card.name || "Card"}: ${card.content || card.text || ""}`),
    section("Latest User Instruction", userInstruction),
  ].filter(Boolean);

  return parts.join("\n\n");
}

export function buildRoleplayMessages({
  run,
  sourceNovel,
  deviations = [],
  changePool = [],
  userInstruction = "",
  recentSegments = [],
  retrievedCards = [],
} = {}) {
  const taskBlock = buildRoleplayTaskBlock({
    run,
    sourceNovel,
    deviations,
    changePool,
    userInstruction,
    recentSegments,
    retrievedCards,
  });
  const { chapter, chunk } = getSourceChunk(
    sourceNovel,
    run?.currentChapterIndex || 0,
    run?.currentChunkIndex || 0,
  );
  const currentPosition = chapter
    ? `${chapter.title || `Chapter ${(run?.currentChapterIndex || 0) + 1}`} / chunk ${(run?.currentChunkIndex || 0) + 1}`
    : "";
  const userTask = [
    "请严格以【本轮原文】为依据改编本段，不要另起一个无关故事。",
    currentPosition ? section("本轮位置", currentPosition) : "",
    section("本轮原文", chunk?.rawText),
    clean(userInstruction) ? section("用户本轮行动/改动", userInstruction) : "",
    "只输出中文小说正文，不要输出分析、报告、标题、说明或 JSON。Output only Chinese novel prose.",
  ].filter(Boolean).join("\n\n");
  return [
    { role: "system", content: taskBlock },
    {
      role: "user",
      content: userTask,
    },
  ].filter((message) => clean(message.content));
}
