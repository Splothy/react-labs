import ProfileCard from './components/ProfileCard'
import './App.css'

function App() {
  const student = {
    name: 'Ярослав Ковальчук',
    group: 'КН-311',
    technologies: ['React 19', 'TypeScript', 'Next.js'],
  }

  return (
    <main className="app-container">
      <ProfileCard
        name={student.name}
        group={student.group}
        technologies={student.technologies}
      />
    </main>
  )
}

export default App
