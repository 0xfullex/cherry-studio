import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserShortcutState } from '@renderer/types'

export interface ShortcutsState {
  userShortcuts: UserShortcutState[]
}

const initialState: ShortcutsState = {
  // Initially empty - user shortcuts will be populated from static definitions + user preferences
  userShortcuts: []
}

const getSerializableUserShortcuts = (userShortcuts: UserShortcutState[]) => {
  return userShortcuts.map((shortcut) => ({
    name: shortcut.name,
    key: [...shortcut.key],
    enabled: shortcut.enabled,
    // Add legacy fields for backward compatibility with the main process
    system: false,
    editable: true
  }))
}

const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    setUserShortcuts: (state, action: PayloadAction<UserShortcutState[]>) => {
      state.userShortcuts = action.payload
      window.api.shortcuts.update(getSerializableUserShortcuts(state.userShortcuts))
    },
    updateUserShortcut: (state, action: PayloadAction<UserShortcutState>) => {
      const existingIndex = state.userShortcuts.findIndex((s) => s.name === action.payload.name)
      if (existingIndex >= 0) {
        state.userShortcuts[existingIndex] = action.payload
      } else {
        state.userShortcuts.push(action.payload)
      }
      window.api.shortcuts.update(getSerializableUserShortcuts(state.userShortcuts))
    },
    toggleUserShortcut: (state, action: PayloadAction<string>) => {
      const existingIndex = state.userShortcuts.findIndex((s) => s.name === action.payload)
      if (existingIndex >= 0) {
        state.userShortcuts[existingIndex].enabled = !state.userShortcuts[existingIndex].enabled
      } else {
        // If user shortcut doesn't exist, create one with enabled: false
        state.userShortcuts.push({
          name: action.payload,
          key: [],
          enabled: false
        })
      }
      window.api.shortcuts.update(getSerializableUserShortcuts(state.userShortcuts))
    },
    resetUserShortcuts: (state) => {
      state.userShortcuts = []
      window.api.shortcuts.update(getSerializableUserShortcuts(state.userShortcuts))
    }
  }
})

export const { setUserShortcuts, updateUserShortcut, toggleUserShortcut, resetUserShortcuts } = shortcutsSlice.actions

// Legacy exports for backward compatibility
export const updateShortcut = updateUserShortcut
export const toggleShortcut = toggleUserShortcut
export const resetShortcuts = resetUserShortcuts

export default shortcutsSlice.reducer
export { initialState }
