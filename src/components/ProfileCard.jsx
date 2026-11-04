import { useState } from 'react'
/*const ProfileCard = ({ name = '', group = '', technologies = [] }) => {}
const ProfileCard = function(props) {}*/
export default function ProfileCard({
  name = '',
  group = '',
  technologies = [],
}) {
  const [likes, setLikes] = useState(0)

  return (
    <article className="profile-card">
      <h2>Про мене</h2>
      <p className="profile-field">
        <strong>Ім’я:</strong> {name}
      </p>
      <p className="profile-field">
        <strong>Група:</strong> {group}
      </p>
      <div className="profile-technologies">
        <h3>Технології, які я хочу опанувати:</h3>
        <ul>
          {technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="like-button"
        onClick={() => setLikes((prev) => prev + 1)}
      >
        ❤️ Подобається: {likes}
      </button>
    </article>
  )
}
