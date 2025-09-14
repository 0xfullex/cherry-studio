import { ShortcutService } from '@renderer/services/ShortcutService'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'

const NavigationHandler: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const showSettingsShortcut = ShortcutService.getShortcut('show_settings')
  const showSettingsShortcutEnabled = showSettingsShortcut?.enabled ?? true

  useHotkeys(
    'meta+, ! ctrl+,',
    function () {
      if (location.pathname.startsWith('/settings')) {
        return
      }
      navigate('/settings/provider')
    },
    {
      splitKey: '!',
      enableOnContentEditable: true,
      enableOnFormTags: true,
      enabled: showSettingsShortcutEnabled
    }
  )

  return null
}

export default NavigationHandler
