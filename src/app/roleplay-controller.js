import {
  createSourceNovelFromStructuredPlan,
  createSourceNovelFromText,
  findFirstStoryChapterIndex,
  getSourceChunk,
} from "../domain/roleplay/source-novel.js";
import {
  activeRoleplayRun,
  advanceRoleplayCursor,
  appendRoleplaySegment,
  clampRoleplayCursor,
  createCausalDeviation,
  createMainlineAnchor,
  createRoleplayChange,
  createRoleplayRun,
  hydrateRoleplayState,
  jumpRoleplayCursor,
  updateMainlineAnchor,
  updateRoleplayDeviation,
  updateRoleplaySegment,
} from "../domain/roleplay/roleplay-model.js";
import { buildRoleplayMessages } from "../domain/roleplay/roleplay-context-builder.js";
import {
  buildRoleplayStateUpdateMessages,
  parseRoleplayStateUpdate,
} from "../domain/roleplay/roleplay-state-updater.js";
import { clean } from "../utils/text.js";

const SEGMENT_SUMMARY_LIMIT = 360;
const CHAPTER_SUMMARY_LIMIT = 1600;

const GLOBAL_DEVIATION_PATTERN = /(从现在|以后|一直|永久|全局|设定|主角|主创|身份|性别|变成|改成|改为|女|男|克莱恩|名字|人格|阵营|能力|职业|出身)/i;
const ARC_DEVIATION_PATTERN = /(本卷|这一卷|长期|后续|接下来|主线|支线|关系线|剧情线|因果|伏笔|诅咒|规则|目标|任务)/i;

function ensureRoleplayState(session) {
  session.roleplay = hydrateRoleplayState(session.roleplay);
  return session.roleplay;
}

function activeSourceNovel(roleplay, run = activeRoleplayRun(roleplay)) {
  if (!run) return null;
  return roleplay.sourceNovels.find((novel) => novel.id === run.novelId) || null;
}

function findSourcePositionBySegment(sourceNovel, segment) {
  const chapter = (sourceNovel?.chapters || []).find((item) => item.id === segment?.sourceChapterId)
    || sourceNovel?.chapters?.[0]
    || null;
  const chunkId = segment?.sourceChunkIds?.[0];
  const chunk = chapter?.chunks?.find((item) => item.id === chunkId) || null;
  return { chapter, chunk };
}

export function startRoleplayRunFromText(session, {
  title = "",
  text = "",
  chunkOptions = {},
  chapterIndex = null,
  chunkIndex = 0,
  mainlineWindowSize,
  structurePlan = null,
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const sourceNovel = structurePlan
    ? createSourceNovelFromStructuredPlan({ title, text, plan: structurePlan, chunkOptions })
    : createSourceNovelFromText({ title, text, chunkOptions });
  const startChapterIndex = chapterIndex !== null && chapterIndex !== undefined && Number.isFinite(Number(chapterIndex))
    ? Math.max(0, Number(chapterIndex))
    : findFirstStoryChapterIndex(sourceNovel);
  const run = createRoleplayRun({
    sessionId: session.id,
    novelId: sourceNovel.id,
    currentChapterIndex: startChapterIndex,
    currentChunkIndex: chunkIndex,
    mainlineWindowSize,
  });
  roleplay.sourceNovels = [...roleplay.sourceNovels, sourceNovel];
  roleplay.runs = [...roleplay.runs, run];
  roleplay.activeRunId = run.id;
  return { roleplay, sourceNovel, run };
}

export function addRoleplayDeviation(session, input = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const deviation = createCausalDeviation({
    ...input,
    createdAtChapter: input.createdAtChapter ?? run?.currentChapterIndex,
    createdAtChunk: input.createdAtChunk ?? run?.currentChunkIndex,
  });
  roleplay.deviations = [...roleplay.deviations, deviation];
  if (run) {
    run.deviationIds = Array.from(new Set([...(run.deviationIds || []), deviation.id]));
    run.updatedAt = Date.now();
  }
  return deviation;
}

export function inferRoleplayDeviationScope(description = "", fallback = "chapter") {
  const value = clean(description);
  if (!value) return fallback;
  if (GLOBAL_DEVIATION_PATTERN.test(value)) return "global";
  if (ARC_DEVIATION_PATTERN.test(value)) return "arc";
  return fallback;
}

export function patchRoleplayDeviation(session, deviationId, patch = {}) {
  const roleplay = ensureRoleplayState(session);
  let updated = null;
  roleplay.deviations = roleplay.deviations.map((deviation) => {
    if (deviation.id !== deviationId) return deviation;
    updated = updateRoleplayDeviation(deviation, patch);
    return updated;
  });
  return updated;
}

export function abandonRoleplayDeviation(session, deviationId) {
  return patchRoleplayDeviation(session, deviationId, { status: "abandoned" });
}

export function jumpActiveRoleplayCursor(session, chapterIndex = 0, chunkIndex = 0) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  if (!run || !sourceNovel) return null;
  const jumped = clampRoleplayCursor(jumpRoleplayCursor(run, chapterIndex, chunkIndex), sourceNovel);
  roleplay.runs = roleplay.runs.map((item) => (item.id === run.id ? jumped : item));
  roleplay.activeRunId = jumped.id;
  return jumped;
}

export function addRoleplayAnchor(session, input = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  const chapterIndex = Number.isFinite(Number(input.chapterIndex))
    ? Math.max(0, Number(input.chapterIndex))
    : Math.max(0, run?.currentChapterIndex || 0);
  const anchor = createMainlineAnchor({
    ...input,
    deadlineChapterIndex: input.deadlineChapterIndex ?? chapterIndex,
  });
  roleplay.mainlineAnchors = [...(roleplay.mainlineAnchors || []), anchor];
  if (sourceNovel?.chapters?.[chapterIndex]) {
    const chapter = sourceNovel.chapters[chapterIndex];
    chapter.anchors = [...(chapter.anchors || []), anchor];
    sourceNovel.updatedAt = Date.now();
  }
  return anchor;
}

function compactText(text, limit = SEGMENT_SUMMARY_LIMIT) {
  const value = clean(text).replace(/\s+/g, " ");
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

export function buildRoleplaySegmentSummary({
  userInstruction = "",
  outputText = "",
} = {}) {
  const parts = [];
  const instruction = compactText(userInstruction, 120);
  const output = compactText(outputText, 260);
  if (instruction) parts.push(`User deviation/action: ${instruction}`);
  if (output) parts.push(`Adapted result: ${output}`);
  return compactText(parts.join(" | "), SEGMENT_SUMMARY_LIMIT);
}

function appendChapterSummary(chapter, segmentSummary) {
  const summary = clean(segmentSummary);
  if (!chapter || !summary) return "";
  const previous = clean(chapter.summary);
  const next = previous ? `${previous}\n- ${summary}` : `- ${summary}`;
  return next.length > CHAPTER_SUMMARY_LIMIT
    ? `- Earlier chapter progress compressed.\n${next.slice(-CHAPTER_SUMMARY_LIMIT).trim()}`
    : next;
}

function updateRoleplaySourceSummaries(sourceNovel, run, segment, {
  chapter,
  chunk,
} = {}) {
  if (!sourceNovel || !run || !segment) return;
  const summary = clean(segment.summary);
  if (chunk && summary) {
    chunk.summary = summary;
    chunk.updatedAt = Date.now();
  }
  if (chapter && summary) {
    chapter.summary = appendChapterSummary(chapter, summary);
    chapter.updatedAt = Date.now();
  }
  sourceNovel.updatedAt = Date.now();
}

function updateRunSegment(roleplay, runId, segmentId, patch = {}) {
  let updated = null;
  roleplay.runs = roleplay.runs.map((run) => {
    if (run.id !== runId) return run;
    const next = createRoleplayRun(run);
    next.segments = next.segments.map((segment) => {
      if (segment.id !== segmentId) return segment;
      updated = updateRoleplaySegment(segment, patch);
      return updated;
    });
    next.updatedAt = Date.now();
    return next;
  });
  return updated;
}

function touchRoleplayDeviations(roleplay, ids = [], segmentSummary = "") {
  const idSet = new Set(ids.filter(Boolean));
  if (!idSet.size) return;
  roleplay.deviations = roleplay.deviations.map((deviation) => {
    if (!idSet.has(deviation.id)) return deviation;
    const recoveryStrategy = clean(deviation.recoveryStrategy)
      || compactText(`Continue carrying this deviation through later chunks: ${segmentSummary}`, 220);
    return updateRoleplayDeviation(deviation, {
      recoveryStrategy,
      status: deviation.status === "abandoned" ? "abandoned" : "active",
    });
  });
}

export function buildActiveRoleplayMessages(session, {
  userInstruction = "",
  retrievedCards = [],
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  if (!run || !sourceNovel) return [];
  return buildRoleplayMessages({
    run,
    sourceNovel,
    deviations: roleplay.deviations,
    changePool: roleplay.changePool,
    userInstruction,
    recentSegments: run.segments,
    retrievedCards,
  });
}

export function buildChapterChangeSummaryMessages(session, {
  chapterIndex = 0,
  segmentIds = [],
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  if (!run || !sourceNovel) return [];
  const chapter = sourceNovel.chapters?.[chapterIndex];
  const idSet = new Set(segmentIds.filter(Boolean));
  const segments = (run.segments || []).filter((segment) => {
    if (idSet.size) return idSet.has(segment.id);
    return segment.sourceChapterId === chapter?.id;
  });
  if (!chapter || !segments.length) return [];
  const body = [
    "Summarize what changed in this completed chapter for future roleplay continuity.",
    "Return short Chinese bullets only. Focus on user-caused causal changes, altered relationships, new constraints, unresolved consequences, and bridge-back requirements.",
    "",
    `[Chapter]\n${chapter.title || `Chapter ${chapterIndex + 1}`}`,
    "",
    "[Segments]",
    ...segments.map((segment, index) => [
      `#${index + 1}`,
      clean(segment.userInstruction) ? `User: ${segment.userInstruction}` : "User: Continue",
      `Output summary: ${segment.summary || clean(segment.outputText).slice(0, 300)}`,
    ].join("\n")),
  ].join("\n");
  return [{ role: "user", content: body }];
}

export function appendRoleplayChange(session, input = {}) {
  const roleplay = ensureRoleplayState(session);
  const change = createRoleplayChange(input);
  if (!clean(change.summary)) return null;
  roleplay.changePool = [
    ...(roleplay.changePool || []).filter((item) => item.chapterIndex !== change.chapterIndex),
    change,
  ].slice(-20);
  return change;
}

export function buildActiveRoleplayStateUpdateMessages(session, {
  segment,
  userInstruction = "",
  outputText = "",
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  if (!run || !sourceNovel || !segment) return [];
  const { chapter, chunk } = findSourcePositionBySegment(sourceNovel, segment);
  const activeDeviationIds = new Set(run.deviationIds || []);
  const deviations = roleplay.deviations.filter((item) => {
    if (item.status === "abandoned") return false;
    return activeDeviationIds.has(item.id) || item.scope === "arc" || item.scope === "global";
  });
  const anchors = (sourceNovel.chapters || []).flatMap((item) => item.anchors || [])
    .filter((item) => item.status !== "abandoned" && item.status !== "fulfilled");
  return buildRoleplayStateUpdateMessages({
    sourceNovel,
    chapter,
    chunk,
    segment,
    deviations,
    anchors,
    userInstruction,
    outputText,
  });
}

export function applyRoleplayStateUpdate(session, updateInput = {}, {
  runId = "",
  segmentId = "",
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const update = typeof updateInput === "string" ? parseRoleplayStateUpdate(updateInput) : updateInput;
  const run = roleplay.runs.find((item) => item.id === runId) || activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  const segment = run?.segments?.find((item) => item.id === segmentId) || run?.segments?.at?.(-1);
  if (!run || !sourceNovel || !segment) return null;
  const { chapter, chunk } = findSourcePositionBySegment(sourceNovel, segment);
  const segmentSummary = clean(update.segmentSummary);
  const chapterSummary = clean(update.chapterSummary);
  let updatedSegment = segment;
  if (segmentSummary) {
    updatedSegment = updateRunSegment(roleplay, run.id, segment.id, { summary: segmentSummary }) || segment;
    if (chunk) {
      chunk.summary = segmentSummary;
      chunk.updatedAt = Date.now();
    }
  }
  if (chapter && chapterSummary) {
    chapter.summary = chapterSummary;
    chapter.updatedAt = Date.now();
  }
  (update.deviationUpdates || []).forEach((item) => {
    const patch = {};
    if (["active", "resolved", "abandoned"].includes(item.status)) patch.status = item.status;
    if (clean(item.recoveryStrategy)) patch.recoveryStrategy = item.recoveryStrategy;
    if (Object.keys(patch).length) patchRoleplayDeviation(session, item.id, patch);
  });
  const anchorUpdates = update.anchorUpdates || [];
  if (anchorUpdates.length) {
    const updateById = new Map(anchorUpdates.map((item) => [item.id, item]));
    sourceNovel.chapters = (sourceNovel.chapters || []).map((sourceChapter) => ({
      ...sourceChapter,
      anchors: (sourceChapter.anchors || []).map((anchor) => {
        const patch = updateById.get(anchor.id);
        if (!patch) return anchor;
        const status = ["open", "fulfilled", "abandoned"].includes(patch.status) ? patch.status : anchor.status;
        return updateMainlineAnchor(anchor, {
          status,
          storyFunction: patch.storyFunction || anchor.storyFunction,
          fulfilledAtSegmentId: status === "fulfilled" ? segment.id : anchor.fulfilledAtSegmentId,
        });
      }),
    }));
    roleplay.mainlineAnchors = (roleplay.mainlineAnchors || []).map((anchor) => {
      const patch = updateById.get(anchor.id);
      if (!patch) return anchor;
      const status = ["open", "fulfilled", "abandoned"].includes(patch.status) ? patch.status : anchor.status;
      return updateMainlineAnchor(anchor, {
        status,
        storyFunction: patch.storyFunction || anchor.storyFunction,
        fulfilledAtSegmentId: status === "fulfilled" ? segment.id : anchor.fulfilledAtSegmentId,
      });
    });
  }
  (update.newAnchors || []).forEach((item) => {
    addRoleplayAnchor(session, {
      ...item,
      chapterIndex: run.currentChapterIndex,
    });
  });
  sourceNovel.updatedAt = Date.now();
  return { segment: updatedSegment, update };
}

export function commitRoleplayOutput(session, {
  outputText = "",
  userInstruction = "",
  summary = "",
  continuityReport = "",
  createdDeviationIds = [],
  updatedDeviationIds = [],
  advance = true,
} = {}) {
  const roleplay = ensureRoleplayState(session);
  const run = activeRoleplayRun(roleplay);
  const sourceNovel = activeSourceNovel(roleplay, run);
  if (!run || !sourceNovel) return null;
  const { chapter, chunk } = getSourceChunk(sourceNovel, run.currentChapterIndex, run.currentChunkIndex);
  const completedChapterIndex = run.currentChapterIndex;
  const segmentSummary = summary || buildRoleplaySegmentSummary({ userInstruction, outputText });
  const { run: withSegment, segment } = appendRoleplaySegment(run, {
    sourceChapterId: chapter?.id || "",
    sourceChunkIds: chunk?.id ? [chunk.id] : [],
    userInstruction,
    outputText,
    summary: segmentSummary,
    continuityReport,
    createdDeviationIds,
    updatedDeviationIds,
  });
  updateRoleplaySourceSummaries(sourceNovel, run, segment, { chapter, chunk });
  touchRoleplayDeviations(roleplay, [...createdDeviationIds, ...updatedDeviationIds], segment.summary);
  const nextRun = advance ? advanceRoleplayCursor(withSegment, sourceNovel) : withSegment;
  const chapterCompleted = advance && nextRun.currentChapterIndex !== completedChapterIndex;
  roleplay.runs = roleplay.runs.map((item) => (item.id === run.id ? nextRun : item));
  roleplay.activeRunId = nextRun.id;
  return { run: nextRun, segment, chapterCompleted, completedChapterIndex };
}
