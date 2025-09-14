import type { UseShortcutOptions } from '@renderer/services/ShortcutService'
import { ShortcutService } from '@renderer/services/ShortcutService'
import { useAppSelector } from '@renderer/store'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { ValidShortcutNames } from '@shared/config/shortcuts'

const defaultOptions: UseShortcutOptions = {
  preventDefault: true,
  enableOnFormTags: true,
  enabled: true
}

/**
 * Register a shortcut with callback
 * @param shortcutKey - Shortcut key identifier
 * @param callback - Callback function to execute when shortcut is triggered
 * @param options - Shortcut configuration options
 */
export const useShortcut = (
  shortcutKey: ValidShortcutNames,
  callback: (e: KeyboardEvent) => void,
  options: UseShortcutOptions = defaultOptions
) => {
  const { hotkey, options: hotkeyOptions } = ShortcutService.getHotkeyConfig(shortcutKey, options)

  // Memoize the callback to prevent unnecessary re-registrations
  const memoizedCallback = useCallback(
    (e: KeyboardEvent) => {
      if (options.preventDefault) {
        e.preventDefault()
      }
      if (options.enabled !== false) {
        callback(e)
      }
    },
    [callback, options.preventDefault, options.enabled]
  )

  useHotkeys(hotkey, memoizedCallback, hotkeyOptions)
}

/**
 * Get all shortcuts with reactive updates
 * @returns Object containing shortcuts array
 */
export function useShortcuts() {
  // Keep Redux subscription to ensure component re-renders on shortcut changes
  useAppSelector((state) => state.shortcuts.userShortcuts)

  return { shortcuts: ShortcutService.getAllShortcuts() }
}

/**
 * Get shortcut display text with reactive updates
 * @param key - Shortcut key identifier
 * @returns Formatted shortcut display text
 */
export function useShortcutDisplay(key: ValidShortcutNames) {
  // Keep Redux subscription to ensure component re-renders on shortcut changes
  useAppSelector((state) => state.shortcuts.userShortcuts)

  return ShortcutService.getShortcutDisplayText(key)
}

// Export types for backward compatibility
export type { UseShortcutOptions }
