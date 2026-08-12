/**
 * Per-client setup guides. One module per client so a copy edit touches a
 * ~200-line file instead of the whole catalogue.
 */
import { deepchatGuide } from './deepchat'
import { cherryStudioGuide } from './cherry-studio'
import { chatboxGuide } from './chatbox'
import { lobeChatGuide } from './lobe-chat'
import { nextchatGuide } from './nextchat'
import { openWebuiGuide } from './open-webui'
import { immersiveTranslateGuide } from './immersive-translate'
import { geminiCliGuide } from './gemini-cli'
import type { ClientGuide } from './shared'

export type { ClientGuide, GuideShot, L, LStr, B } from './shared'

export const clientGuides: Record<string, ClientGuide> = {
  deepchat: deepchatGuide,
  'cherry-studio': cherryStudioGuide,
  chatbox: chatboxGuide,
  'lobe-chat': lobeChatGuide,
  nextchat: nextchatGuide,
  'open-webui': openWebuiGuide,
  'immersive-translate': immersiveTranslateGuide,
  'gemini-cli': geminiCliGuide,
}
