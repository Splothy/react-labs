/**
 * Вкладки — складений компонент (compound component): `Tabs` і його частини
 * `Tabs.List`, `Tabs.Tab` і `Tabs.Panel`. Вміст кожної частини приходить між
 * її тегами як `children`, а яка вкладка обрана, частини дізнаються з
 * контексту, який створює `Tabs`.
 *
 * Використання:
 *   <Tabs defaultValue="brew">
 *     <Tabs.List aria-label="Про каву">
 *       <Tabs.Tab value="brew">Заварювання</Tabs.Tab>
 *       <Tabs.Tab value="reviews">Відгуки</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel value="brew">…</Tabs.Panel>
 *     <Tabs.Panel value="reviews">…</Tabs.Panel>
 *   </Tabs>
 *
 * Вимоги — у тестах tests/Tabs.children.test.jsx і tests/Tabs.a11y.test.jsx.
 */
import { createContext, use, useId, useState } from 'react'

const TabsContext = createContext(null)

function useTabs() {
  const context = use(TabsContext)
  if (!context) throw new Error('Частини вкладок мають бути всередині <Tabs>')
  return context
}

export default function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue)
  const id = useId()

  return (
    <TabsContext value={{ value, setValue, id }}>
      <div className="tabs">{children}</div>
    </TabsContext>
  )
}

function TabsList({ children, ...props }) {
  function handleKeyDown(event) {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll('[role="tab"]'),
    )
    const index = tabs.indexOf(event.target)
    if (index === -1) return

    let nextIndex
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length
        break
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    tabs[nextIndex].focus()
  }

  return (
    <div
      className="tab-list"
      {...props}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

function TabsTab({ value, children }) {
  const { value: selectedValue, setValue, id } = useTabs()
  const selected = selectedValue === value
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      aria-controls={`${id}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      onFocus={() => setValue(value)}
    >
      {children}
    </button>
  )
}

function TabsPanel({ value, children }) {
  const { value: selectedValue, id } = useTabs()
  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      tabIndex={0}
      hidden={selectedValue !== value}
    >
      {children}
    </div>
  )
}

Tabs.List = TabsList
Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel
