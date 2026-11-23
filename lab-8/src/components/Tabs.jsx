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
import { createContext, use, useState } from 'react'

const TabsContext = createContext(null)

function useTabs() {
  const context = use(TabsContext)
  if (!context) throw new Error('Частини вкладок мають бути всередині <Tabs>')
  return context
}

export default function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue)

  return (
    <TabsContext value={{ value, setValue }}>
      <div className="tabs">{children}</div>
    </TabsContext>
  )
}

function TabsList({ children, ...props }) {
  return (
    <div className="tab-list" {...props}>
      {children}
    </div>
  )
}

function TabsTab({ value, children }) {
  const { value: selectedValue, setValue } = useTabs()
  return (
    <button
      type="button"
      className={selectedValue === value ? 'active' : ''}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  )
}

function TabsPanel({ value, children }) {
  const { value: selectedValue } = useTabs()
  return <div hidden={selectedValue !== value}>{children}</div>
}

Tabs.List = TabsList
Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel
