import { uid } from "../../utils/id.js";
import { clean } from "../../utils/text.js";

export const DEFAULT_MAINLINE_WINDOW_SIZE = 100000;

export function createCausalDeviation(input = {}) {
  return {
    id: input.id || uid("dev"),
    scope: ["local", "chapter", "arc", "global"].includes(input.scope) ? input.scope : "local",
    status: ["active", "resolved", "abandoned"].includes(input.status) ? input.status : "active",
    description: clean(input.description),
    sourceUserMessageId: clean(input.sourceUserMessageId),
    createdAtChapter: Number(input.createdAtChapter) || 0,
    createdAtChunk: Number(input.createdAtChunk) || 0,
    affectedCharacters: Array.isArray(input.affectedCharacters) ? input.affectedCharacters.map(clean).filter(Boolean) : [],
    affectedAnchors: Array.isArray(input.affectedAnchors) ? input.affectedAnchors.map(clean).filter(Boolean) : [],
    mustRevert: Boolean(input.mustRevert),
    recoveryStrategy: clean(input.recoveryStrategy),
    createdAt: Number(input.createdAt) || Date.now(),
    updatedAt: Number(input.updatedAt) || Date.now(),
  };
}

export function createMainlineAnchor(input = {}) {
  return {
    id: input.id || uid("anchor"),
    type: ["event", "clue", "relationship", "reveal", "foreshadow", "transition", "other"].includes(input.type) ? input.type : "event",
    status: ["open", "fulfilled", "abandoned"].includes(input.status) ? input.status : "open",
    description: clean(input.description),
    storyFunction: clean(input.storyFunction || input.description),
    importance: ["low", "medium", "high", "critical"].includes(input.importance) ? input.importance : "medium",
    deadlineChapterIndex: Number.isFinite(Number(input.deadlineChapterIndex))
      ? Math.max(0, Number(input.deadlineChapterIndex))
      : null,
    fulfilledAtSegmentId: clean(input.fulfilledAtSegmentId),
    createdAt: Number(input.createdAt) || Date.now(),
    updatedAt: Number(input.updatedAt) || Date.now(),
  };
}

export function createRoleplayChange(input = {}) {
  return {
    id: input.id || uid("change"),
    chapterIndex: Math.max(0, Number(input.chapterIndex) || 0),
    chapterTitle: clean(input.chapterTitle),
    summary: clean(input.summary),
    sourceSegmentIds: Array.isArray(input.sourceSegmentIds) ? input.sourceSegmentIds.map(clean).filter(Boolean) : [],
    createdAt: Number(input.createdAt) || Date.now(),
    updatedAt: Number(input.updatedAt) || Date.now(),
  };
}

export function createRoleplayStructureTool(input = {}) {
  return {
    providerId: clean(input.providerId),
    model: clean(input.model),
    updatedAt: Number(input.updatedAt) || 0,
  };
}

export function createRoleplaySegment(input = {}) {
  return {
    id: input.id || uid("rseg"),
    runId: clean(input.runId),
    sourceChapterId: clean(input.sourceChapterId),
    sourceChunkIds: Array.isArray(input.sourceChunkIds) ? input.sourceChunkIds.map(clean).filter(Boolean) : [],
    userInstruction: clean(input.userInstruction),
    outputText: clean(input.outputText),
    summary: clean(input.summary),
    createdDeviationIds: Array.isArray(input.createdDeviationIds) ? input.createdDeviationIds.map(clean).filter(Boolean) : [],
    updatedDeviationIds: Array.isArray(input.updatedDeviationIds) ? input.updatedDeviationIds.map(clean).filter(Boolean) : [],
    continuityReport: clean(input.continuityReport),
    createdAt: Number(input.createdAt) || Date.now(),
  };
}

export function createRoleplayRun(input = {}) {
  return {
    id: input.id || uid("rrun"),
    sessionId: clean(input.sessionId),
    novelId: clean(input.novelId),
    currentChapterIndex: Math.max(0, Number(input.currentChapterIndex) || 0),
    currentChunkIndex: Math.max(0, Number(input.currentChunkIndex) || 0),
    mode: ["playing", "bridging"].includes(input.mode) ? input.mode : "playing",
    mainlineWindowSize: Math.max(1000, Number(input.mainlineWindowSize) || DEFAULT_MAINLINE_WINDOW_SIZE),
    deviationIds: Array.isArray(input.deviationIds) ? input.deviationIds.map(clean).filter(Boolean) : [],
    segments: Array.isArray(input.segments || input.rewriteSegments)
      ? (input.segments || input.rewriteSegments).map(createRoleplaySegment)
      : [],
    createdAt: Number(input.createdAt) || Date.now(),
    updatedAt: Number(input.updatedAt) || Date.now(),
  };
}

export function createRoleplayState(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    toolbarOpen: Boolean(input.toolbarOpen),
    inspectorOpen: Boolean(input.inspectorOpen),
    annotationMode: ["source", "deviation", "anchor"].includes(input.annotationMode) ? input.annotationMode : "source",
    sourceNovels: Array.isArray(input.sourceNovels) ? input.sourceNovels : [],
    runs: Array.isArray(input.runs) ? input.runs.map(createRoleplayRun) : [],
    activeRunId: clean(input.activeRunId),
    deviations: Array.isArray(input.deviations) ? input.deviations.map(createCausalDeviation) : [],
    mainlineAnchors: Array.isArray(input.mainlineAnchors) ? input.mainlineAnchors.map(createMainlineAnchor) : [],
    changePool: Array.isArray(input.changePool) ? input.changePool.map(createRoleplayChange) : [],
    structureTool: createRoleplayStructureTool(input.structureTool),
  };
}

export function hydrateRoleplayState(input = {}) {
  const state = createRoleplayState(input);
  if (state.activeRunId && !state.runs.some((run) => run.id === state.activeRunId)) {
    state.activeRunId = state.runs[0]?.id || "";
  }
  return state;
}

export function activeRoleplayRun(state) {
  const runs = Array.isArray(state?.runs) ? state.runs : [];
  return runs.find((run) => run.id === state?.activeRunId) || runs[0] || null;
}

export function appendRoleplaySegment(run, segmentInput = {}) {
  const next = createRoleplayRun(run);
  const segment = createRoleplaySegment({
    ...segmentInput,
    runId: next.id,
  });
  next.segments = [...next.segments, segment];
  next.updatedAt = Date.now();
  return { run: next, segment };
}

export function updateRoleplaySegment(segment, patch = {}) {
  return createRoleplaySegment({
    ...segment,
    ...patch,
    id: segment?.id,
    runId: segment?.runId,
    createdAt: segment?.createdAt,
  });
}

export function advanceRoleplayCursor(run, sourceNovel) {
  const next = createRoleplayRun(run);
  const chapter = sourceNovel?.chapters?.[next.currentChapterIndex];
  const chunkCount = chapter?.chunks?.length || 0;
  if (next.currentChunkIndex + 1 < chunkCount) {
    next.currentChunkIndex += 1;
  } else if (next.currentChapterIndex + 1 < (sourceNovel?.chapters?.length || 0)) {
    next.currentChapterIndex += 1;
    next.currentChunkIndex = 0;
  }
  next.updatedAt = Date.now();
  return next;
}

export function jumpRoleplayCursor(run, chapterIndex = 0, chunkIndex = 0) {
  const next = createRoleplayRun(run);
  next.currentChapterIndex = Math.max(0, Number(chapterIndex) || 0);
  next.currentChunkIndex = Math.max(0, Number(chunkIndex) || 0);
  next.mode = "bridging";
  next.updatedAt = Date.now();
  return next;
}

export function clampRoleplayCursor(run, sourceNovel) {
  const next = createRoleplayRun(run);
  const chapterCount = sourceNovel?.chapters?.length || 0;
  if (!chapterCount) return next;
  next.currentChapterIndex = Math.max(0, Math.min(next.currentChapterIndex, chapterCount - 1));
  const chunkCount = sourceNovel.chapters[next.currentChapterIndex]?.chunks?.length || 0;
  next.currentChunkIndex = Math.max(0, Math.min(next.currentChunkIndex, Math.max(0, chunkCount - 1)));
  return next;
}

export function updateRoleplayDeviation(deviation, patch = {}) {
  return createCausalDeviation({
    ...deviation,
    ...patch,
    id: deviation?.id,
    createdAt: deviation?.createdAt,
    updatedAt: Date.now(),
  });
}

export function updateMainlineAnchor(anchor, patch = {}) {
  return createMainlineAnchor({
    ...anchor,
    ...patch,
    id: anchor?.id,
    createdAt: anchor?.createdAt,
    updatedAt: Date.now(),
  });
}
