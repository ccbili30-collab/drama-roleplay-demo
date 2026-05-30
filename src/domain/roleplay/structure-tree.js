import { clean } from "../../utils/text.js";

const CORE_LEVELS = new Set(["core", "arc", "volume", "book", "part", "major", "major_theme", "big_theme"]);
const THEME_LEVELS = new Set(["theme", "topic", "section", "small_theme", "minor", "beat_group"]);
const PLACEHOLDER_TITLE_PATTERN = /(AI\s*)?(尚未|未)?识别.*(大主题|主题)|未识别大主题|临时结构/i;

function numeric(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function markerRangeSize(marker = {}) {
  return Math.max(0, numeric(marker.endParagraphIndex) - numeric(marker.startParagraphIndex));
}

function containsRange(parent = {}, child = {}) {
  return numeric(child.startParagraphIndex) >= numeric(parent.startParagraphIndex)
    && numeric(child.endParagraphIndex) <= numeric(parent.endParagraphIndex);
}

function markerLabel(marker = {}, fallback = "") {
  const label = clean(marker.title || marker.name || marker.summary);
  if (!label || PLACEHOLDER_TITLE_PATTERN.test(label)) return fallback;
  return label;
}

function markerLevel(marker = {}) {
  return clean(marker.level || marker.type || marker.scale).toLowerCase();
}

function chapterInMarker(chapter = {}, marker = {}) {
  if (!Number.isFinite(Number(chapter.startParagraphIndex)) || !Number.isFinite(Number(chapter.endParagraphIndex))) {
    return false;
  }
  return containsRange(marker, chapter);
}

function isCoreMarker(marker = {}, allMarkers = []) {
  const level = markerLevel(marker);
  if (CORE_LEVELS.has(level)) return true;
  if (THEME_LEVELS.has(level) || clean(marker.parentId)) return false;
  return allMarkers.some((candidate) => clean(candidate.parentId) === marker.id);
}

function findContainingCore(marker = {}, cores = []) {
  if (clean(marker.parentId)) {
    const direct = cores.find((core) => core.id === marker.parentId);
    if (direct) return direct;
  }
  return cores
    .filter((core) => core.id !== marker.id && containsRange(core, marker))
    .sort((a, b) => markerRangeSize(a) - markerRangeSize(b))[0] || null;
}

function findBestThemeForChapter(chapter = {}, themes = []) {
  const explicitMarkerId = clean(chapter.markerId);
  if (explicitMarkerId) {
    const exact = themes.find((theme) => theme.id === explicitMarkerId);
    if (exact) return exact;
  }
  return themes
    .filter((theme) => chapterInMarker(chapter, theme))
    .sort((a, b) => markerRangeSize(a) - markerRangeSize(b))[0] || null;
}

function createSyntheticCore(chapters = []) {
  const first = chapters[0] || {};
  const last = chapters[chapters.length - 1] || first;
  return {
    id: "core-local",
    index: 0,
    level: "core",
    title: "全文结构",
    summary: "",
    anchors: [],
    startParagraphIndex: numeric(first.startParagraphIndex),
    endParagraphIndex: numeric(last.endParagraphIndex),
    synthetic: true,
  };
}

function createSyntheticTheme(core = {}, chapters = []) {
  return {
    id: `${core.id}-theme-local`,
    index: 0,
    level: "theme",
    title: "章节结构",
    summary: "",
    anchors: [],
    startParagraphIndex: numeric(core.startParagraphIndex, numeric(chapters[0]?.startParagraphIndex)),
    endParagraphIndex: numeric(core.endParagraphIndex, numeric(chapters.at(-1)?.endParagraphIndex)),
    parentId: core.id,
    synthetic: true,
  };
}

export function buildRoleplayStructureTree(sourceNovel = {}) {
  const chapters = Array.isArray(sourceNovel.chapters) ? sourceNovel.chapters : [];
  const markers = (Array.isArray(sourceNovel.storyMarkers) ? sourceNovel.storyMarkers : [])
    .map((marker, index) => ({
      ...marker,
      id: clean(marker.id) || `marker-${index}`,
      index,
      level: markerLevel(marker) || "theme",
      title: markerLabel(marker, `结构 ${index + 1}`),
      parentId: clean(marker.parentId),
      startParagraphIndex: numeric(marker.startParagraphIndex),
      endParagraphIndex: numeric(marker.endParagraphIndex),
    }))
    .sort((a, b) => numeric(a.startParagraphIndex) - numeric(b.startParagraphIndex));

  const coreMarkers = markers.filter((marker) => isCoreMarker(marker, markers));
  const cores = coreMarkers.length ? coreMarkers : [createSyntheticCore(chapters)];
  const themes = markers.filter((marker) => !cores.some((core) => core.id === marker.id));

  return cores.map((core, coreIndex) => {
    const coreThemes = themes
      .filter((theme) => {
        const parent = findContainingCore(theme, cores);
        return parent?.id === core.id;
      })
      .sort((a, b) => numeric(a.startParagraphIndex) - numeric(b.startParagraphIndex));
    const chapterCandidates = chapters.filter((chapter) => chapterInMarker(chapter, core) || !markers.length);
    const effectiveThemes = coreThemes.length ? coreThemes : [createSyntheticTheme(core, chapterCandidates)];

    const themeNodes = effectiveThemes.map((theme, themeIndex) => {
      const themeChapters = chapterCandidates
        .filter((chapter) => {
          if (theme.synthetic) return true;
          const bestTheme = findBestThemeForChapter(chapter, effectiveThemes);
          return bestTheme?.id === theme.id;
        })
        .sort((a, b) => numeric(a.index) - numeric(b.index));
      return {
        ...theme,
        index: themeIndex,
        chapters: themeChapters,
      };
    }).filter((theme) => theme.chapters.length || !theme.synthetic);

    const assigned = new Set(themeNodes.flatMap((theme) => theme.chapters.map((chapter) => chapter.id)));
    const looseChapters = chapterCandidates.filter((chapter) => !assigned.has(chapter.id));
    if (looseChapters.length) {
      themeNodes.push({
        ...createSyntheticTheme(core, looseChapters),
        id: `${core.id}-theme-other`,
        title: "其他章节",
        index: themeNodes.length,
        chapters: looseChapters,
      });
    }

    return {
      ...core,
      index: coreIndex,
      themes: themeNodes,
    };
  }).filter((core) => core.themes.length || !chapters.length);
}
