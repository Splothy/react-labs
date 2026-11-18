import { useActionState } from 'react'
import { z } from 'zod'
import { subscribe } from '../api.js'
import SubmitButton from './SubmitButton.jsx'

const emailSchema = z.email('Вкажіть адресу на кшталт olena@gmail.com')

async function subscribeAction(previousState, formData) {
  const email = formData.get('email')
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return { ok: false, message: result.error.issues[0].message, email }
  }
  return subscribe(result.data)
}

export default function SubscribeForm() {
  const [state, formAction] = useActionState(subscribeAction, null)

  return (
    <form className="subscribe-form" action={formAction} noValidate>
      <label>
        Email для новин
        <input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state?.email}
          aria-invalid={state?.ok === false ? 'true' : 'false'}
          aria-describedby="subscribe-status"
        />
      </label>
      <SubmitButton />
      <p
        id="subscribe-status"
        role="status"
        className={state?.ok === false ? 'status error' : 'status'}
      >
        {state?.message}
      </p>
    </form>
  )
}
