import { clean } from "../../utils/text.js";

function clampList(items, limit = 12) {
  return Array.isArray(items) ? items.slice(0, limit) : [];
}

function asJsonBlock(value) {
  return JSON.stringify(value, null, 2);
}

function extractJsonObject(text) {
  const value = clean(text);
  if (!value) return null;
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : value;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function buildRoleplayStateUpdateMessages({
  sourceNovel,
  chapter,
  chunk,
  segment,
  deviations = [],
  anchors = [],
  userInstruction = "",
  outputText = "",
} = {}) {
  const payload = {
    novelTitle: sourceNovel?.title || "",
    sourceChapter: chapter?.title || "",
    sourceChunkSummary: chunk?.summary || "",
    sourceExcerpt: clean(chunk?.rawText).slice(0, 2200),
    userInstruction,
    adaptedOutput: outputText || segment?.outputText || "",
    activeDeviations: clampList(deviations, 16).map((item) => ({
      id: item.id,
      status: item.status,
      scope: item.scope,
      description: item.description,
      recoveryStrategy: item.recoveryStrategy,
    })),
    futureAnchors: clampList(anchors, 16).map((item) => ({
      id: item.id,
      status: item.status || "open",
      type: item.type,
      importance: item.importance,
      description: item.description,
      storyFunction: item.storyFunction,
    })),
  };
  const schema = {
    segmentSummary: "One concise hidden summary of this adapted segment.",
    chapterSummary: "Updated rolling chapter summary. Keep under 900 Chinese characters or 500 English words.",
    deviationUpdates: [
      {
        id: "existing deviation id",
        status: "active | resolved | abandoned",
        recoveryStrategy: "short bridge/recovery instruction",
      },
    ],
    anchorUpdates: [
      {
        id: "existing anchor id",
        status: "open | fulfilled | abandoned",
        storyFunction: "updated short story function",
      },
    ],
    newAnchors: [
      {
        description: "new future mainline anchor if this segment creates one",
        storyFunction: "why it matters",
        type: "event | clue | relationship | reveal | foreshadow | transition | other",
        importance: "low | medium | high | critical",
      },
    ],
  };
  return [
    {
      role: "system",
      content: [
        "You are TBird's hidden roleplay state updater.",
        "Return strict JSON only. Do not write prose for the user.",
        "Judge what changed after this adapted segment: summaries, causal deviations, and mainline anchors.",
        "Do not invent many anchors. Add a new anchor only if the adapted output creates a clear future obligation.",
        "Use existing ids exactly when updating existing deviations or anchors.",
        "",
        "[JSON Schema]",
        asJsonBlock(schema),
      ].join("\n"),
    },
    {
      role: "user",
      content: asJsonBlock(payload),
    },
  ];
}

export function parseRoleplayStateUpdate(text) {
  const parsed = extractJsonObject(text);
  if (!parsed || typeof parsed !== "object") {
    return {
      segmentSummary: "",
      chapterSummary: "",
      deviationUpdates: [],
      anchorUpdates: [],
      newAnchors: [],
    };
  }
  return {
    segmentSummary: clean(parsed.segmentSummary),
    chapterSummary: clean(parsed.chapterSummary),
    deviationUpdates: Array.isArray(parsed.deviationUpdates) ? parsed.deviationUpdates.map((item) => ({
      id: clean(item?.id),
      status: clean(item?.status),
      recoveryStrategy: clean(item?.recoveryStrategy),
    })).filter((item) => item.id) : [],
    anchorUpdates: Array.isArray(parsed.anchorUpdates) ? parsed.anchorUpdates.map((item) => ({
      id: clean(item?.id),
      status: clean(item?.status),
      storyFunction: clean(item?.storyFunction),
    })).filter((item) => item.id) : [],
    newAnchors: Array.isArray(parsed.newAnchors) ? parsed.newAnchors.map((item) => ({
      description: clean(item?.description),
      storyFunction: clean(item?.storyFunction || item?.description),
      type: clean(item?.type),
      importance: clean(item?.importance),
    })).filter((item) => item.description) : [],
  };
}
