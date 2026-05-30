import { clean } from "../../utils/text.js";

const ROLEPLAY_COMMAND_PATTERN = /^(\/?(跑团|写|续写|继续|下一段|下一章|next|continue)\b|继续$|继续写|继续改|下一段$|下段$|下一章$)/i;
const DISCUSSION_PATTERN = /(吗|么|？|\?|为什么|怎么|如何|能不能|可不可以|要不要|是不是|有没有|有什么|聊聊|讨论|解释|分析|建议|头绪|原因|问题在哪|怎么看)/;
const ROLEPLAY_ACTION_PATTERN = /(开始第一段|生成|写一段|写出来|续写|改写|修改|重写|调整|替换|加入|删除|保留|回轨|圆回来|承接|把.+(改成|变成|换成)|让.+(变成|成为|去|做)|按照.+(写|改|继续))/;
const DISCUSSION_FIRST_PATTERN = /^(为什么|怎么会|怎么回事|如何理解|解释|分析|建议|讨论|聊聊|你觉得|有没有可能|什么原因|问题在哪|怎么看)/;

export function getRoleplayInputIntent(text = "") {
  const value = clean(text);
  if (!value) return "roleplay";
  if (ROLEPLAY_COMMAND_PATTERN.test(value)) return "roleplay";
  if (ROLEPLAY_ACTION_PATTERN.test(value) && !DISCUSSION_FIRST_PATTERN.test(value)) return "roleplay";
  if (DISCUSSION_PATTERN.test(value)) return "chat";
  return "chat";
}

export function roleplayIntentLabel(intent = "chat") {
  return intent === "roleplay" ? "推进" : "交流";
}
