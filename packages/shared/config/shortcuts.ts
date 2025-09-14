/**
 * Shared shortcut configuration
 * This file contains all static shortcut definitions that are shared between main and renderer processes
 */

// the type will be saved in the redux store and config store
export type UserShortcutType = {
  name: keyof DefaultShortcutConfigs
  key: string[]
  enabled: boolean
  editable?: boolean
}

// the type which defines the shortcut config
export type ShortcutConfigType = {
  key: string[]
  enabled: boolean
  editable: boolean
  platforms?: ('win' | 'mac' | 'linux')[] // Platform restrictions
}

export type ValidShortcutNames =
  | 'zoom_in'
  | 'zoom_out'
  | 'zoom_reset'
  | 'show_settings'
  | 'show_app'
  | 'mini_window'
  | 'exit_fullscreen'
  | 'selection_assistant_toggle'
  | 'selection_assistant_select_text'
  | 'new_topic'
  | 'clear_topic'
  | 'toggle_new_context'
  | 'copy_last_message'
  | 'toggle_show_assistants'
  | 'toggle_show_topics'
  | 'search_message_in_chat'
  | 'search_message'

export type DefaultShortcutConfigs = {
  [key in ValidShortcutNames]: ShortcutConfigType
}

/**
 * All shortcut definitions
 * Static configuration that defines the behavior and default values for shortcuts
 */
export const defaultShortcutConfigs: DefaultShortcutConfigs = {
  // Zoom shortcuts
  zoom_in: {
    key: ['CommandOrControl', '='],
    enabled: true,
    editable: false
  },
  zoom_out: {
    key: ['CommandOrControl', '-'],
    enabled: true,
    editable: false
  },
  zoom_reset: {
    key: ['CommandOrControl', '0'],
    enabled: true,
    editable: false
  },

  // System shortcuts
  show_settings: {
    key: ['CommandOrControl', ','],
    enabled: true,
    editable: false
  },
  show_app: {
    key: [],
    enabled: false,
    editable: true
  },
  mini_window: {
    key: ['CommandOrControl', 'E'],
    enabled: false,
    editable: true
  },
  exit_fullscreen: {
    key: ['Escape'],
    enabled: true,
    editable: false
  },

  // Selection assistant shortcuts (Windows/Mac only)
  selection_assistant_toggle: {
    key: [],
    enabled: false,
    editable: true,
    platforms: ['win', 'mac']
  },
  selection_assistant_select_text: {
    key: [],
    enabled: false,
    editable: true,
    platforms: ['win', 'mac']
  },

  // Editor shortcuts
  new_topic: {
    key: ['CommandOrControl', 'N'],
    enabled: true,
    editable: true
  },
  clear_topic: {
    key: ['CommandOrControl', 'L'],
    enabled: true,
    editable: true
  },
  toggle_new_context: {
    key: ['CommandOrControl', 'K'],
    enabled: true,
    editable: true
  },
  copy_last_message: {
    key: ['CommandOrControl', 'Shift', 'C'],
    enabled: false,
    editable: true
  },

  // Navigation shortcuts
  toggle_show_assistants: {
    key: ['CommandOrControl', '['],
    enabled: true,
    editable: true
  },
  toggle_show_topics: {
    key: ['CommandOrControl', ']'],
    enabled: true,
    editable: true
  },
  search_message_in_chat: {
    key: ['CommandOrControl', 'F'],
    enabled: true,
    editable: true
  },
  search_message: {
    key: ['CommandOrControl', 'Shift', 'F'],
    enabled: true,
    editable: true
  }
}
