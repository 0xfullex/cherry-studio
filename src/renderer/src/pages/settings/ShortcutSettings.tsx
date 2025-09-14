import { ClearOutlined, UndoOutlined } from '@ant-design/icons'
import { HStack } from '@renderer/components/Layout'
import { isMac, isWin } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useShortcuts } from '@renderer/hooks/useShortcuts'
import { useTimer } from '@renderer/hooks/useTimer'
import { getShortcutLabel } from '@renderer/i18n/label'
import { ShortcutService } from '@renderer/services/ShortcutService'
import { DefaultShortcutConfigs } from '@shared/config/shortcuts'
import { Button, Input, InputRef, Switch, Table as AntTable, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingGroup, SettingTitle } from '.'

const ShortcutSettings: FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { shortcuts: originalShortcuts } = useShortcuts()
  const inputRefs = useRef<Record<string, InputRef>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const { setTimeoutTimer } = useTimer()

  //if shortcut is not available on all the platforms, block the shortcut here
  let shortcuts = originalShortcuts
  if (!isWin && !isMac) {
    //Selection Assistant only available on Windows now
    const excludedShortcuts = ['selection_assistant_toggle', 'selection_assistant_select_text']
    shortcuts = shortcuts.filter((s) => !excludedShortcuts.includes(s.name))
  }

  const handleClear = (shortcutName: keyof DefaultShortcutConfigs) => {
    ShortcutService.clearShortcut(shortcutName)
  }

  const handleAddShortcut = (shortcutName: keyof DefaultShortcutConfigs) => {
    setEditingKey(shortcutName)
    setTimeoutTimer(
      'handleAddShortcut',
      () => {
        inputRefs.current[shortcutName]?.focus()
      },
      0
    )
  }

  const isShortcutModified = (shortcutName: keyof DefaultShortcutConfigs) => {
    return ShortcutService.isShortcutModified(shortcutName)
  }

  const handleResetShortcut = (shortcutName: keyof DefaultShortcutConfigs) => {
    ShortcutService.resetShortcut(shortcutName)
  }

  const handleKeyDown = (e: React.KeyboardEvent, shortcutName: keyof DefaultShortcutConfigs) => {
    const success = ShortcutService.handleKeyDownForShortcut(e, shortcutName)
    if (success) {
      setEditingKey(null)
    }
  }

  const handleResetAllShortcuts = () => {
    window.modal.confirm({
      title: t('settings.shortcuts.reset_defaults_confirm'),
      centered: true,
      onOk: () => ShortcutService.resetAllShortcuts()
    })
  }

  // 由于启用了showHeader = false，不再需要title字段
  const columns: ColumnsType<Shortcut> = [
    {
      // title: t('settings.shortcuts.action'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      // title: t('settings.shortcuts.label'),
      dataIndex: 'key',
      key: 'key',
      align: 'right',
      render: (key: string[], record: Shortcut) => {
        const shortcutName = record.name as keyof DefaultShortcutConfigs
        const isEditing = editingKey === shortcutName
        const shortcutConfig = shortcuts.find((s) => s.name === shortcutName)
        const isEditable = shortcutConfig?.editable !== false

        return (
          <HStack style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <HStack alignItems="center" style={{ position: 'relative' }}>
              {isEditing ? (
                <ShortcutInput
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[shortcutName] = el
                    }
                  }}
                  value={ShortcutService.formatShortcutForDisplay(key)}
                  placeholder={t('settings.shortcuts.press_shortcut')}
                  onKeyDown={(e) => handleKeyDown(e, shortcutName)}
                  onBlur={(e) => {
                    const isUndoClick = e.relatedTarget?.closest('.shortcut-undo-icon')
                    if (!isUndoClick) {
                      setEditingKey(null)
                    }
                  }}
                />
              ) : (
                <ShortcutText isEditable={isEditable} onClick={() => isEditable && handleAddShortcut(shortcutName)}>
                  {key.length > 0
                    ? ShortcutService.formatShortcutForDisplay(key)
                    : t('settings.shortcuts.press_shortcut')}
                </ShortcutText>
              )}
            </HStack>
          </HStack>
        )
      }
    },
    {
      // title: t('settings.shortcuts.actions'),
      key: 'actions',
      align: 'right',
      width: '70px',
      render: (_, record: Shortcut) => {
        const shortcutName = record.name as keyof DefaultShortcutConfigs
        return (
          <HStack style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title={t('settings.shortcuts.reset_to_default')}>
              <Button
                icon={<UndoOutlined />}
                size="small"
                shape="circle"
                onClick={() => handleResetShortcut(shortcutName)}
                disabled={!isShortcutModified(shortcutName)}
              />
            </Tooltip>
            <Tooltip title={t('settings.shortcuts.clear_shortcut')}>
              <Button
                icon={<ClearOutlined />}
                size="small"
                shape="circle"
                onClick={() => handleClear(shortcutName)}
                disabled={record.key.length === 0 || !record.editable}
              />
            </Tooltip>
          </HStack>
        )
      }
    },
    {
      // title: t('settings.shortcuts.enabled'),
      key: 'enabled',
      align: 'right',
      width: '50px',
      render: (record: Shortcut) => (
        <Switch
          size="small"
          checked={record.enabled}
          onChange={() => ShortcutService.toggleShortcut(record.name as keyof DefaultShortcutConfigs)}
        />
      )
    }
  ]

  return (
    <SettingContainer theme={theme}>
      <SettingGroup theme={theme} style={{ paddingBottom: 0 }}>
        <SettingTitle>{t('settings.shortcuts.title')}</SettingTitle>
        <SettingDivider style={{ marginBottom: 0 }} />
        <Table
          columns={columns as ColumnsType<unknown>}
          dataSource={shortcuts.map((s) => ({ ...s, name: getShortcutLabel(s.name) }))}
          pagination={false}
          size="middle"
          showHeader={false}
        />
        <SettingDivider style={{ marginBottom: 0 }} />
        <HStack justifyContent="flex-end" padding="16px 0">
          <Button onClick={handleResetAllShortcuts}>{t('settings.shortcuts.reset_defaults')}</Button>
        </HStack>
      </SettingGroup>
    </SettingContainer>
  )
}

const Table = styled(AntTable)`
  .ant-table {
    background: transparent;
  }

  .ant-table-cell {
    padding: 14px 0 !important;
    background: transparent !important;
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
`

const ShortcutInput = styled(Input)`
  width: 120px;
  text-align: center;
`

const ShortcutText = styled.span<{ isEditable: boolean }>`
  cursor: ${({ isEditable }) => (isEditable ? 'pointer' : 'not-allowed')};
  padding: 4px 11px;
  opacity: ${({ isEditable }) => (isEditable ? 1 : 0.5)};
`

export default ShortcutSettings
