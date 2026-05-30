import { uid } from "../../utils/id.js";
import { createSettings, hydrateSessionSettings } from "../settings/settings-model.js";
import { createDefaultNovel } from "../novel/novel-model.js";
import { createRoleplayState, hydrateRoleplayState } from "../roleplay/roleplay-model.js";

export const SESSION_KIND_CHAT = "chat";
export const SESSION_KIND_ROLEPLAY = "roleplay";

export function normalizeSessionKind(kind) {
  return kind === SESSION_KIND_ROLEPLAY ? SESSION_KIND_ROLEPLAY : SESSION_KIND_CHAT;
}

function hasRoleplayPayload(roleplay = {}) {
  return Boolean(
    roleplay?.enabled
    || roleplay?.activeRunId
    || roleplay?.sourceNovels?.length
    || roleplay?.runs?.length
    || roleplay?.deviations?.length
    || roleplay?.mainlineAnchors?.length
    || roleplay?.changePool?.length
  );
}

export function createAssistantVersion(content = "", usage = null) {
  return {
    id: uid("ver"),
    content,
    usage,
    createdAt: Date.now(),
  };
}

export function createRootNode() {
  return {
    id: "root",
    role: "root",
    parentId: null,
    children: [],
    activeChildId: null,
    createdAt: Date.now(),
  };
}

export function createWriterState(overrides = {}) {
  return {
    styleCache: overrides.styleCache || "",
    styleCacheUpdatedAt: Number(overrides.styleCacheUpdatedAt) || 0,
    styleCacheSourceHash: overrides.styleCacheSourceHash || "",
    inheritingStyle: Boolean(overrides.inheritingStyle),
    modelOverride: overrides.modelOverride && typeof overrides.modelOverride === "object"
      ? { ...overrides.modelOverride }
      : {},
  };
}

export function hydrateWriterState(writerState = {}) {
  return createWriterState(writerState);
}

export function createComposerDraft(overrides = {}) {
  return {
    text: typeof overrides.text === "string" ? overrides.text : "",
    attachments: Array.isArray(overrides.attachments) ? overrides.attachments : [],
    updatedAt: Number(overrides.updatedAt) || 0,
  };
}

export function hydrateComposerDraft(composerDraft = {}) {
  return createComposerDraft(composerDraft);
}

export function createSession(title = "新会话", options = {}) {
  const root = createRootNode();
  const kind = normalizeSessionKind(options.kind);
  return {
    id: uid("sess"),
    kind,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archivedAt: 0,
    creatorId: options.creatorId || "",
    rootId: root.id,
    nodes: { [root.id]: root },
    settings: createSettings(),
    novel: createDefaultNovel(),
    roleplay: createRoleplayState(),
    writerState: createWriterState(),
    composerDraft: createComposerDraft(),
  };
}

export function hydrateSession(session, legacySettings = {}) {
  session.settings = hydrateSessionSettings(session.settings || legacySettings);
  session.novel = { ...createDefaultNovel(), ...(session.novel || {}) };
  session.roleplay = hydrateRoleplayState(session.roleplay || session.rewrite);
  session.kind = session.kind
    ? normalizeSessionKind(session.kind)
    : (hasRoleplayPayload(session.roleplay) ? SESSION_KIND_ROLEPLAY : SESSION_KIND_CHAT);
  session.roleplay.enabled = session.kind === SESSION_KIND_ROLEPLAY;
  delete session.rewrite;
  session.archivedAt = Number(session.archivedAt) || 0;
  session.creatorId ||= "";
  session.writerState = hydrateWriterState(session.writerState);
  session.composerDraft = hydrateComposerDraft(session.composerDraft);
  session.rootId ||= "root";
  session.nodes ||= {};
  session.nodes[session.rootId] ||= createRootNode();
  Object.values(session.nodes).forEach((node) => {
    node.children ||= [];
    node.activeChildId = node.children.includes(node.activeChildId) ? node.activeChildId : node.children[0] || null;
    if (node.role === "assistant") {
      node.versions ||= [];
      if (!node.versions.length) node.versions.push(createAssistantVersion(""));
      node.activeVersionId ||= node.versions[0].id;
    }
  });
  return session;
}
