import { uid } from "../../utils/id.js";
import { clean } from "../../utils/text.js";

export const DEFAULT_CHUNK_TARGET_LENGTH = 1000;
export const DEFAULT_CHUNK_MIN_LENGTH = 800;
export const DEFAULT_CHUNK_MAX_LENGTH = 1500;
export const STRUCTURE_DIGEST_EXCERPT_LENGTH = 180;

const CHAPTER_HEADING_PATTERN = /^\s*(\u7b2c[\u96f6\u3007\u4e00\u4e8c\u4e24\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343\u4e07\d]+[\u7ae0\u8282\u5377\u56de\u90e8\u96c6].{0,48}|chapter\s+\d+.{0,48}|ch\.\s*\d+.{0,48})\s*$/i;

function normalizeSourceText(text) {
  return String(text ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function countCjkAwareLength(text) {
  return String(text ?? "").replace(/\s+/g, "").length;
}

export function splitTextIntoParagraphs(text) {
  const source = normalizeSourceText(text);
  if (!source) return [];
  const paragraphs = [];
  let offset = 0;
  const lines = source.split("\n");
  lines.forEach((line) => {
    const rawText = line.trim();
    const foundAt = source.indexOf(rawText, offset);
    const startOffset = foundAt >= 0 ? foundAt : offset;
    const endOffset = startOffset + rawText.length;
    offset = endOffset + 1;
    if (!rawText) return;
    paragraphs.push({
      index: paragraphs.length,
      rawText,
      excerpt: rawText.replace(/\s+/g, " ").slice(0, STRUCTURE_DIGEST_EXCERPT_LENGTH),
      startOffset,
      endOffset,
      length: countCjkAwareLength(rawText),
    });
  });
  if (!paragraphs.length && source) {
    paragraphs.push({
      index: 0,
      rawText: source,
      excerpt: source.replace(/\s+/g, " ").slice(0, STRUCTURE_DIGEST_EXCERPT_LENGTH),
      startOffset: 0,
      endOffset: source.length,
      length: countCjkAwareLength(source),
    });
  }
  return paragraphs;
}

function sentenceSplit(text) {
  const source = normalizeSourceText(text);
  if (!source) return [];
  const pieces = source.match(/[^\u3002\uff01\uff1f!?\uff1b;\u2026\n]+[\u3002\uff01\uff1f!?\uff1b;\u2026]*|\n+/g) || [source];
  return pieces.map((piece) => piece).filter((piece) => piece.length);
}

function bestSplitIndex(buffer, minLength, maxLength) {
  if (buffer.length <= maxLength) return buffer.length;
  const windowStart = Math.max(minLength, Math.floor(maxLength * 0.55));
  const candidates = ["\n\n", "\n", "\u3002", "\uff01", "\uff1f", "\uff1b", ".", "!", "?", ";", "\uff0c", ","];
  for (const marker of candidates) {
    const index = buffer.lastIndexOf(marker, maxLength);
    if (index >= windowStart) return index + marker.length;
  }
  return maxLength;
}

export function splitTextIntoChunks(text, {
  targetLength = DEFAULT_CHUNK_TARGET_LENGTH,
  minLength = DEFAULT_CHUNK_MIN_LENGTH,
  maxLength = DEFAULT_CHUNK_MAX_LENGTH,
} = {}) {
  const source = normalizeSourceText(text);
  if (!source) return [];
  const safeTarget = Math.max(40, Number(targetLength) || DEFAULT_CHUNK_TARGET_LENGTH);
  const safeMin = Math.max(20, Math.min(Number(minLength) || DEFAULT_CHUNK_MIN_LENGTH, safeTarget));
  const safeMax = Math.max(safeTarget, Number(maxLength) || DEFAULT_CHUNK_MAX_LENGTH);
  const units = sentenceSplit(source);
  const chunks = [];
  let buffer = "";
  let startOffset = 0;
  let consumed = 0;

  function flush(force = false) {
    const textValue = buffer.trim();
    if (!textValue) return;
    const length = countCjkAwareLength(textValue);
    if (!force && length < safeMin) return;
    chunks.push({
      id: uid("chunk"),
      index: chunks.length,
      rawText: textValue,
      summary: "",
      startOffset,
      endOffset: consumed,
      length,
    });
    buffer = "";
    startOffset = consumed;
  }

  units.forEach((unit) => {
    buffer += unit;
    consumed += unit.length;
    const length = countCjkAwareLength(buffer);
    if (length >= safeTarget) {
      if (length <= safeMax) {
        flush(true);
        return;
      }
      while (countCjkAwareLength(buffer) > safeMax) {
        const splitIndex = bestSplitIndex(buffer, safeMin, safeMax);
        const head = buffer.slice(0, splitIndex).trim();
        if (head) {
          chunks.push({
            id: uid("chunk"),
            index: chunks.length,
            rawText: head,
            summary: "",
            startOffset,
            endOffset: startOffset + splitIndex,
            length: countCjkAwareLength(head),
          });
        }
        buffer = buffer.slice(splitIndex);
        startOffset += splitIndex;
      }
      flush(false);
    }
  });

  if (buffer.trim()) {
    if (chunks.length && countCjkAwareLength(buffer) < Math.floor(safeMin * 0.45)) {
      const last = chunks[chunks.length - 1];
      last.rawText = `${last.rawText}\n${buffer.trim()}`.trim();
      last.endOffset = consumed;
      last.length = countCjkAwareLength(last.rawText);
    } else {
      flush(true);
    }
  }

  return chunks.map((chunk, index) => ({ ...chunk, index }));
}

export function splitTextIntoChapters(text) {
  const source = normalizeSourceText(text);
  if (!source) return [];
  const lines = source.split("\n");
  const chapters = [];
  let current = null;
  let offset = 0;

  function pushCurrent(endOffset) {
    if (!current) return;
    const rawText = current.lines.join("\n").trim();
    if (!rawText) return;
    chapters.push({
      id: uid("chapter"),
      index: chapters.length,
      title: clean(current.title) || `Chapter ${chapters.length + 1}`,
      rawText,
      summary: "",
      anchors: [],
      startOffset: current.startOffset,
      endOffset,
    });
  }

  lines.forEach((line) => {
    const lineWithBreakLength = line.length + 1;
    if (CHAPTER_HEADING_PATTERN.test(line)) {
      pushCurrent(offset);
      current = {
        title: clean(line),
        lines: [],
        startOffset: offset,
      };
    } else {
      if (!current) {
        current = {
          title: "Preface",
          lines: [],
          startOffset: 0,
        };
      }
      current.lines.push(line);
    }
    offset += lineWithBreakLength;
  });
  pushCurrent(source.length);

  if (!chapters.length) {
    return [{
      id: uid("chapter"),
      index: 0,
      title: "Chapter 1",
      rawText: source,
      summary: "",
      anchors: [],
      startOffset: 0,
      endOffset: source.length,
    }];
  }

  return chapters;
}

export function createSourceNovelFromText({
  title = "",
  text = "",
  chunkOptions = {},
} = {}) {
  const rawText = normalizeSourceText(text);
  const chapters = splitTextIntoChapters(rawText).map((chapter, index) => ({
    ...chapter,
    index,
    chunks: splitTextIntoChunks(chapter.rawText, chunkOptions),
  }));
  return {
    id: uid("novel"),
    title: clean(title) || "Imported TXT",
    rawText,
    chapters,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function normalizePlanChapters(planChapters = [], paragraphCount = 0) {
  if (!Array.isArray(planChapters) || !paragraphCount) return [];
  return planChapters
    .map((chapter, index) => {
      const start = Number(chapter.startParagraphIndex ?? chapter.start ?? chapter.from);
      const end = Number(chapter.endParagraphIndex ?? chapter.end ?? chapter.to);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      return {
        title: clean(chapter.title) || `Chapter ${index + 1}`,
        type: clean(chapter.type) || "main",
        summary: clean(chapter.summary),
        markerId: clean(chapter.markerId || chapter.storyMarkerId || chapter.themeId),
        markerTitle: clean(chapter.markerTitle || chapter.storyMarkerTitle || chapter.themeTitle || chapter.majorTheme),
        segments: Array.isArray(chapter.segments || chapter.chunks || chapter.parts)
          ? (chapter.segments || chapter.chunks || chapter.parts)
          : [],
        anchors: Array.isArray(chapter.anchors)
          ? chapter.anchors.map((anchor) => clean(anchor)).filter(Boolean)
          : [],
        startParagraphIndex: Math.max(0, Math.min(paragraphCount - 1, Math.floor(start))),
        endParagraphIndex: Math.max(0, Math.min(paragraphCount - 1, Math.floor(end))),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startParagraphIndex - b.startParagraphIndex)
    .reduce((chapters, chapter) => {
      const previous = chapters.at(-1);
      if (previous && chapter.startParagraphIndex <= previous.endParagraphIndex) {
        chapter.startParagraphIndex = previous.endParagraphIndex + 1;
      }
      if (chapter.startParagraphIndex > chapter.endParagraphIndex) return chapters;
      chapters.push(chapter);
      return chapters;
    }, []);
}

function normalizePlanStoryMarkers(planMarkers = [], paragraphCount = 0) {
  if (!Array.isArray(planMarkers) || !paragraphCount) return [];
  return planMarkers
    .map((marker, index) => {
      const start = Number(marker.startParagraphIndex ?? marker.start ?? marker.from);
      const end = Number(marker.endParagraphIndex ?? marker.end ?? marker.to);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const safeStart = Math.max(0, Math.min(paragraphCount - 1, Math.floor(start)));
      const safeEnd = Math.max(0, Math.min(paragraphCount - 1, Math.floor(end)));
      if (safeStart > safeEnd) return null;
      return {
        id: clean(marker.id) || uid("story_marker"),
        index,
        level: clean(marker.level || marker.type || marker.scale) || "theme",
        parentId: clean(marker.parentId || marker.parent || marker.coreId || marker.arcId),
        title: clean(marker.title || marker.name) || `大主题 ${index + 1}`,
        summary: clean(marker.summary || marker.description),
        anchors: Array.isArray(marker.anchors)
          ? marker.anchors.map((anchor) => clean(anchor)).filter(Boolean)
          : [],
        startParagraphIndex: safeStart,
        endParagraphIndex: safeEnd,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startParagraphIndex - b.startParagraphIndex)
    .map((marker, index) => ({ ...marker, index }));
}

function normalizePlanSegments(planSegments = [], chapterStart = 0, chapterEnd = 0) {
  if (!Array.isArray(planSegments)) return [];
  return planSegments
    .map((segment, index) => {
      const start = Number(segment.startParagraphIndex ?? segment.start ?? segment.from);
      const end = Number(segment.endParagraphIndex ?? segment.end ?? segment.to);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const safeStart = Math.max(chapterStart, Math.min(chapterEnd, Math.floor(start)));
      const safeEnd = Math.max(chapterStart, Math.min(chapterEnd, Math.floor(end)));
      if (safeStart > safeEnd) return null;
      return {
        title: clean(segment.title || segment.name) || `分段 ${index + 1}`,
        summary: clean(segment.summary || segment.description),
        startParagraphIndex: safeStart,
        endParagraphIndex: safeEnd,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startParagraphIndex - b.startParagraphIndex)
    .reduce((segments, segment) => {
      const previous = segments.at(-1);
      if (previous && segment.startParagraphIndex <= previous.endParagraphIndex) {
        segment.startParagraphIndex = previous.endParagraphIndex + 1;
      }
      if (segment.startParagraphIndex > segment.endParagraphIndex) return segments;
      segments.push(segment);
      return segments;
    }, []);
}

export function createSourceNovelFromStructuredPlan({
  title = "",
  text = "",
  plan = {},
  chunkOptions = {},
} = {}) {
  const rawText = normalizeSourceText(text);
  const paragraphs = splitTextIntoParagraphs(rawText);
  const planned = normalizePlanChapters(plan?.chapters, paragraphs.length);
  if (!planned.length) return createSourceNovelFromText({ title, text, chunkOptions });
  const storyMarkers = normalizePlanStoryMarkers(
    plan?.storyMarkers || plan?.bigThemes || plan?.themes || plan?.arcs || plan?.coreMarkers,
    paragraphs.length,
  );
  const chapters = planned.map((chapterPlan, index) => {
    const chapterParagraphs = paragraphs.slice(chapterPlan.startParagraphIndex, chapterPlan.endParagraphIndex + 1);
    const rawChapterText = chapterParagraphs.map((paragraph) => paragraph.rawText).join("\n\n").trim();
    const plannedSegments = normalizePlanSegments(
      chapterPlan.segments || chapterPlan.chunks || chapterPlan.parts,
      chapterPlan.startParagraphIndex,
      chapterPlan.endParagraphIndex,
    );
    const containingMarker = storyMarkers
      .filter((marker) => (
        chapterPlan.startParagraphIndex >= marker.startParagraphIndex
        && chapterPlan.endParagraphIndex <= marker.endParagraphIndex
      ))
      .sort((a, b) => (
        (a.endParagraphIndex - a.startParagraphIndex) - (b.endParagraphIndex - b.startParagraphIndex)
      ))[0];
    const chapterAnchors = chapterPlan.anchors.map((anchor) => ({
      id: uid("anchor"),
      type: "event",
      status: "open",
      description: anchor,
      storyFunction: anchor,
      importance: "medium",
      deadlineChapterIndex: index,
      fulfilledAtSegmentId: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    const aiChunks = plannedSegments.map((segmentPlan, segmentIndex) => {
      const segmentParagraphs = paragraphs.slice(segmentPlan.startParagraphIndex, segmentPlan.endParagraphIndex + 1);
      const rawSegmentText = segmentParagraphs.map((paragraph) => paragraph.rawText).join("\n\n").trim();
      return {
        id: uid("chunk"),
        index: segmentIndex,
        title: segmentPlan.title,
        summary: segmentPlan.summary,
        rawText: rawSegmentText,
        startOffset: segmentParagraphs[0]?.startOffset || 0,
        endOffset: segmentParagraphs.at(-1)?.endOffset || 0,
        startParagraphIndex: segmentPlan.startParagraphIndex,
        endParagraphIndex: segmentPlan.endParagraphIndex,
        length: countCjkAwareLength(rawSegmentText),
        source: "ai",
      };
    }).filter((chunk) => clean(chunk.rawText));
    return {
      id: uid("chapter"),
      index,
      title: chapterPlan.title || `Chapter ${index + 1}`,
      type: chapterPlan.type,
      rawText: rawChapterText,
      summary: chapterPlan.summary,
      markerId: chapterPlan.markerId || containingMarker?.id || "",
      markerTitle: chapterPlan.markerTitle || containingMarker?.title || "",
      anchors: chapterAnchors,
      startOffset: chapterParagraphs[0]?.startOffset || 0,
      endOffset: chapterParagraphs.at(-1)?.endOffset || 0,
      startParagraphIndex: chapterPlan.startParagraphIndex,
      endParagraphIndex: chapterPlan.endParagraphIndex,
      chunks: aiChunks.length ? aiChunks : splitTextIntoChunks(rawChapterText, chunkOptions),
    };
  });
  return {
    id: uid("novel"),
    title: clean(plan?.title) || clean(title) || "Imported TXT",
    rawText,
    chapters,
    storyMarkers,
    structuredImport: {
      method: clean(plan?.method) || "ai",
      model: clean(plan?.model),
      createdAt: Date.now(),
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function buildStructureDigest(text, {
  maxParagraphs = 1800,
  excerptLength = STRUCTURE_DIGEST_EXCERPT_LENGTH,
} = {}) {
  const paragraphs = splitTextIntoParagraphs(text);
  const selected = paragraphs.slice(0, Math.max(1, Number(maxParagraphs) || 1800));
  return {
    paragraphs,
    truncated: selected.length < paragraphs.length,
    digest: selected.map((paragraph) => {
      const excerpt = paragraph.rawText.replace(/\s+/g, " ").slice(0, excerptLength);
      return `${paragraph.index}: ${excerpt}`;
    }).join("\n"),
  };
}

export function getSourceChunk(sourceNovel, chapterIndex = 0, chunkIndex = 0) {
  const chapter = sourceNovel?.chapters?.[chapterIndex] || null;
  if (!chapter) return { chapter: null, chunk: null };
  return {
    chapter,
    chunk: chapter.chunks?.[chunkIndex] || null,
  };
}

export function findFirstStoryChapterIndex(sourceNovel) {
  const chapters = Array.isArray(sourceNovel?.chapters) ? sourceNovel.chapters : [];
  if (!chapters.length) return 0;
  const firstReadable = chapters.findIndex((chapter) => (
    chapter?.title !== "Preface"
    && (chapter?.chunks || []).some((chunk) => clean(chunk?.rawText))
  ));
  if (firstReadable >= 0) return firstReadable;
  const firstChunked = chapters.findIndex((chapter) => (
    (chapter?.chunks || []).some((chunk) => clean(chunk?.rawText))
  ));
  return Math.max(0, firstChunked);
}
