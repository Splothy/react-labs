import Avatar from './Avatar.jsx'
export default function Profile({ person}) {
  return (
    <article className="profile">
      <Avatar person={person} />
      <h2>{person.name}</h2>
      <p>{person.role}</p>
    </article>
  )
}