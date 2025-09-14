import { isMac, isWin } from '@renderer/config/constant'
import store from '@renderer/store'
import { resetUserShortcuts, toggleUserShortcut, updateUserShortcut } from '@renderer/store/shortcuts'
import { Shortcut, UserShortcutState } from '@renderer/types'
import { type DefaultShortcutConfigs, defaultShortcutConfigs } from '@shared/config/shortcuts'
import { orderBy } from 'lodash'

export interface UseShortcutOptions {
  preventDefault?: boolean
  enableOnFormTags?: boolean
  enabled?: boolean
  description?: string
}

/**
 * ShortcutService - Unified service for shortcut management
 * Consolidates logic previously scattered across useShortcuts.ts and ShortcutSettings.tsx
 */
export class ShortcutService {
  private static defaultOptions: UseShortcutOptions = {
    preventDefault: true,
    enableOnFormTags: true,
    enabled: true
  }

  // ==================== Shortcut Formatting ====================

  /**
   * Format shortcut for react-hotkeys-hook
   * @param key - Array of key strings
   * @returns Formatted shortcut string for react-hotkeys-hook
   */
  static formatShortcutForHotkey(key: string[]): string {
    return key
      .map((k) => {
        switch (k.toLowerCase()) {
          case 'command':
            return 'meta'
          case 'commandorcontrol':
            return isMac ? 'meta' : 'ctrl'
          default:
            return k.toLowerCase()
        }
      })
      .join('+')
  }

  /**
   * Format shortcut for UI display
   * @param key - Array of key strings
   * @returns Formatted shortcut string with platform-specific symbols
   */
  static formatShortcutForDisplay(key: string[]): string {
    return key
      .map((k) => {
        switch (k) {
          // New modifier key handling
          case 'CommandOrControl':
            return isMac ? '⌘' : 'Ctrl'
          case 'Ctrl':
            return isMac ? '⌃' : 'Ctrl'
          case 'Alt':
            return isMac ? '⌥' : 'Alt'
          case 'Meta':
            return isMac ? '⌘' : isWin ? 'Win' : 'Super'
          case 'Shift':
            return isMac ? '⇧' : 'Shift'

          // Backward compatibility with old data
          case 'Command':
          case 'Cmd':
            return isMac ? '⌘' : 'Ctrl'
          case 'Control':
            return isMac ? '⌃' : 'Ctrl'

          // Special keys
          case 'ArrowUp':
            return '↑'
          case 'ArrowDown':
            return '↓'
          case 'ArrowLeft':
            return '←'
          case 'ArrowRight':
            return '→'
          case 'Slash':
            return '/'
          case 'Semicolon':
            return ';'
          case 'BracketLeft':
            return '['
          case 'BracketRight':
            return ']'
          case 'Backslash':
            return '\\'
          case 'Quote':
            return "'"
          case 'Comma':
            return ','
          case 'Minus':
            return '-'
          case 'Equal':
            return '='
          default:
            return k.charAt(0).toUpperCase() + k.slice(1)
        }
      })
      .join(' + ')
  }

  // ==================== Shortcut Validation ====================

  /**
   * Validate if a shortcut is valid
   * @param keys - Array of key strings
   * @returns True if shortcut is valid
   */
  static isValidShortcut(keys: string[]): boolean {
    const hasModifier = keys.some((key) => ['CommandOrControl', 'Ctrl', 'Alt', 'Meta', 'Shift'].includes(key))
    const hasNonModifier = keys.some((key) => !['CommandOrControl', 'Ctrl', 'Alt', 'Meta', 'Shift'].includes(key))
    const hasFnKey = keys.some((key) => /^F\d+$/.test(key))

    return (hasModifier && hasNonModifier && keys.length >= 2) || hasFnKey
  }

  /**
   * Check if shortcut is duplicate
   * @param shortcuts - Array of all shortcuts
   * @param newKey - New shortcut key to check
   * @param currentName - Current shortcut name to exclude from check
   * @returns True if shortcut is duplicate
   */
  static isDuplicateShortcut(shortcuts: Shortcut[], newKey: string[], currentName: string): boolean {
    return shortcuts.some((s) => s.name !== currentName && s.key.length > 0 && s.key.join('+') === newKey.join('+'))
  }

  /**
   * Check if shortcut has been modified from default by name
   * @param name - Shortcut name identifier
   * @returns True if shortcut is modified
   */
  static isShortcutModified(name: keyof DefaultShortcutConfigs): boolean {
    const definition = defaultShortcutConfigs[name]
    const userState = this.getUserShortcutState(name)

    if (!definition) return false
    if (!userState) return false // No user state means using default

    return definition.key.join('+') !== userState.key.join('+')
  }

  // ==================== Keyboard Event Handling ====================

  /**
   * Parse usable end keys from keyboard event
   * @param event - React keyboard event
   * @returns Key code string or null if not usable
   */
  static parseUsableEndKeys(event: React.KeyboardEvent): string | null {
    const { code } = event

    switch (code) {
      case 'KeyA':
      case 'KeyB':
      case 'KeyC':
      case 'KeyD':
      case 'KeyE':
      case 'KeyF':
      case 'KeyG':
      case 'KeyH':
      case 'KeyI':
      case 'KeyJ':
      case 'KeyK':
      case 'KeyL':
      case 'KeyM':
      case 'KeyN':
      case 'KeyO':
      case 'KeyP':
      case 'KeyQ':
      case 'KeyR':
      case 'KeyS':
      case 'KeyT':
      case 'KeyU':
      case 'KeyV':
      case 'KeyW':
      case 'KeyX':
      case 'KeyY':
      case 'KeyZ':
      case 'Digit0':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
      case 'Numpad0':
      case 'Numpad1':
      case 'Numpad2':
      case 'Numpad3':
      case 'Numpad4':
      case 'Numpad5':
      case 'Numpad6':
      case 'Numpad7':
      case 'Numpad8':
      case 'Numpad9':
        return code.slice(-1)
      case 'Space':
      case 'Enter':
      case 'Backspace':
      case 'Tab':
      case 'Delete':
      case 'PageUp':
      case 'PageDown':
      case 'Insert':
      case 'Home':
      case 'End':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'F1':
      case 'F2':
      case 'F3':
      case 'F4':
      case 'F5':
      case 'F6':
      case 'F7':
      case 'F8':
      case 'F9':
      case 'F10':
      case 'F11':
      case 'F12':
      case 'F13':
      case 'F14':
      case 'F15':
      case 'F16':
      case 'F17':
      case 'F18':
      case 'F19':
        return code
      case 'Backquote':
        return '`'
      case 'Period':
        return '.'
      case 'NumpadEnter':
        return 'Enter'
      case 'Slash':
      case 'Semicolon':
      case 'BracketLeft':
      case 'BracketRight':
      case 'Backslash':
      case 'Quote':
      case 'Comma':
      case 'Minus':
      case 'Equal':
        return code
      default:
        return null
    }
  }

  /**
   * Parse keyboard event to shortcut array
   * @param event - React keyboard event
   * @returns Array of key strings
   */
  static parseKeyboardEventToShortcut(event: React.KeyboardEvent): string[] {
    const keys: string[] = []

    // Handle modifier keys for cross-platform compatibility
    if (event.ctrlKey) keys.push(isMac ? 'Ctrl' : 'CommandOrControl')
    if (event.altKey) keys.push('Alt')
    if (event.metaKey) keys.push(isMac ? 'CommandOrControl' : 'Meta')
    if (event.shiftKey) keys.push('Shift')

    const endKey = this.parseUsableEndKeys(event)
    if (endKey) {
      keys.push(endKey)
    }

    return keys
  }

  // ==================== Shortcut State Management ====================

  /**
   * Get user shortcut state by name
   * @param name - Shortcut name
   * @returns User shortcut state or undefined
   */
  private static getUserShortcutState(name: string): UserShortcutState | undefined {
    const userShortcuts = store.getState().shortcuts.userShortcuts
    return userShortcuts.find((s) => s.name === name)
  }

  /**
   * Merge static definition with user state to create complete shortcut
   * @param name - Shortcut name
   * @returns Complete shortcut or undefined if definition doesn't exist
   */
  static getShortcut(name: keyof DefaultShortcutConfigs): Shortcut | undefined {
    const definition = defaultShortcutConfigs[name]
    if (!definition) return undefined

    const userState = this.getUserShortcutState(name)

    return {
      name,
      key: userState?.key || definition.key,
      enabled: userState?.enabled ?? true,
      editable: definition.editable
    }
  }

  /**
   * Get all shortcuts sorted by system shortcuts first
   * @returns Array of shortcuts
   */
  static getAllShortcuts(): Shortcut[] {
    const shortcuts = Object.keys(defaultShortcutConfigs)
      .filter((name) => this.isShortcutSupportedOnPlatform(name as keyof DefaultShortcutConfigs))
      .map((name) => this.getShortcut(name as keyof DefaultShortcutConfigs))
      .filter(Boolean) as Shortcut[]

    return orderBy(shortcuts, 'system', 'desc')
  }

  /**
   * Get shortcut display text
   * @param name - Shortcut name
   * @returns Formatted display text or empty string if disabled
   */
  static getShortcutDisplayText(name: keyof DefaultShortcutConfigs): string {
    const shortcutConfig = this.getShortcut(name)
    return shortcutConfig?.enabled ? this.formatShortcutForDisplay(shortcutConfig.key) : ''
  }

  // ==================== Shortcut Operations ====================

  /**
   * Update shortcut by name with new shortcut keys
   * @param name - Shortcut name identifier
   * @param key - Array of shortcut keys
   */
  static updateShortcutKeys(name: keyof DefaultShortcutConfigs, key: string[]): void {
    const definition = defaultShortcutConfigs[name]
    if (!definition || !definition.editable) return

    const userState = this.getUserShortcutState(name)
    const newUserState: UserShortcutState = {
      name,
      key,
      enabled: userState?.enabled ?? true
    }

    store.dispatch(updateUserShortcut(newUserState))
  }

  /**
   * Toggle shortcut enabled state
   * @param name - Shortcut name
   */
  static toggleShortcut(name: keyof DefaultShortcutConfigs): void {
    store.dispatch(toggleUserShortcut(name))
  }

  /**
   * Reset single shortcut to default value by name
   * @param name - Shortcut name identifier
   */
  static resetShortcut(name: keyof DefaultShortcutConfigs): void {
    const definition = defaultShortcutConfigs[name]
    if (!definition || !definition.editable) return

    this.updateShortcutKeys(name, definition.key)
  }

  /**
   * Clear shortcut by name
   * @param name - Shortcut name identifier
   */
  static clearShortcut(name: keyof DefaultShortcutConfigs): void {
    this.updateShortcutKeys(name, [])
  }

  /**
   * Reset all shortcuts to default values
   */
  static resetAllShortcuts(): void {
    store.dispatch(resetUserShortcuts())
  }

  /**
   * Check if shortcut is supported on current platform
   * @param name - Shortcut name identifier
   * @param platform - Platform to check (defaults to current platform)
   * @returns True if shortcut is supported on the platform
   */
  static isShortcutSupportedOnPlatform(name: keyof DefaultShortcutConfigs, platform?: string): boolean {
    const definition = defaultShortcutConfigs[name]
    if (!definition || !definition.platforms) return true

    const currentPlatform = platform || isMac ? 'mac' : isWin ? 'win' : 'linux'

    return definition.platforms.includes(currentPlatform)
  }

  // ==================== Shortcut Validation and Processing ====================

  /**
   * Handle keyboard event and update shortcut by name
   * @param event - React keyboard event
   * @param name - Shortcut name identifier
   * @returns True if shortcut was successfully updated
   */
  static handleKeyDownForShortcut(event: React.KeyboardEvent, name: keyof DefaultShortcutConfigs): boolean {
    event.preventDefault()

    const keys = this.parseKeyboardEventToShortcut(event)

    if (!this.isValidShortcut(keys)) {
      return false
    }

    const allShortcuts = this.getAllShortcuts()
    if (this.isDuplicateShortcut(allShortcuts, keys, name)) {
      return false
    }

    this.updateShortcutKeys(name, keys)
    return true
  }

  // ==================== React Hotkeys Hook Integration ====================

  /**
   * Get shortcut configuration for react-hotkeys-hook
   * @param name - Shortcut key identifier
   * @param options - Shortcut options
   * @returns Configuration object for useHotkeys hook
   */
  static getHotkeyConfig(name: keyof DefaultShortcutConfigs, options: UseShortcutOptions = this.defaultOptions) {
    const shortcutConfig = this.getShortcut(name)

    return {
      hotkey: shortcutConfig?.enabled ? this.formatShortcutForHotkey(shortcutConfig.key) : 'none',
      enabled: !!shortcutConfig?.enabled,
      options: {
        enableOnFormTags: options.enableOnFormTags,
        description: options.description || shortcutConfig?.name,
        enabled: !!shortcutConfig?.enabled
      },
      shortcutConfig
    }
  }
}
