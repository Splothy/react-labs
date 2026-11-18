import { bookingSchema } from '../bookingSchema.js'
import { startTransition, useActionState, useRef } from 'react'
import { useFormik } from 'formik'
import GuestsStepper from './GuestsStepper.jsx'
import { sendBooking } from '../api.js'

const defaultValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  comment: '',
}

export default function BookingForm() {
  const formRef = useRef(null)
  const formik = useFormik({
    initialValues: defaultValues,
    validateOnChange: false,
    validateOnBlur: true,
    validate(values) {
      const parsed = bookingSchema.safeParse(values)
      const errors = {}
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const name = issue.path[0]
          if (!errors[name]) errors[name] = issue.message
        }
      }
      return errors
    },
    onSubmit(values) {
      if (isPending) return
      const parsed = bookingSchema.safeParse(values)
      if (parsed.success) startTransition(() => dispatch(parsed.data))
    },
  })
  const errors = Object.fromEntries(
    Object.entries(formik.errors).filter(([name]) => formik.touched[name]),
  )
  const comment = formik.values.comment

  function fieldProps(name) {
    return {
      name,
      value: formik.values[name],
      onBlur: formik.handleBlur,
      onChange(event) {
        const value = event.target.value
        const validate =
          Boolean(formik.touched[name]) ||
          (name === 'date' && Boolean(formik.values.time))
        formik.setFieldValue(name, value, validate)
      },
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isPending) return
    const validationErrors = await formik.validateForm()
    if (Object.keys(validationErrors).length) {
      await formik.setTouched(
        Object.fromEntries(
          Object.keys(defaultValues).map((name) => [name, true]),
        ),
        false,
      )
      formRef.current.elements
        .namedItem(Object.keys(validationErrors)[0])
        ?.focus()
      return
    }
    await formik.submitForm()
  }
  const [result, dispatch, isPending] = useActionState(bookTable, null)

  async function bookTable(previousResult, booking) {
    if (booking === null) return null
    const response = await sendBooking(booking)
    if (response.ok) startTransition(() => formik.resetForm())
    return response
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    formRef.current.elements.namedItem('name').focus()
    formik.resetForm()
    startTransition(() => dispatch(null))
  }

  return (
    <form
      className="booking-form"
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className="field">
        <label>
          Ім'я
          <input
            {...fieldProps('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby="name-error"
            autoComplete="name"
            required
          />
        </label>
        <p id="name-error" className="field-error">
          {errors.name}
        </p>
      </div>
      <div className="field">
        <label>
          Телефон
          <input
            type="tel"
            {...fieldProps('phone')}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby="phone-error"
            autoComplete="tel"
            placeholder="+380671234567"
            required
          />
        </label>
        <p id="phone-error" className="field-error">
          {errors.phone}
        </p>
      </div>
      <div className="row">
        <div className="field">
          <label>
            Дата
            <input
              type="date"
              {...fieldProps('date')}
              aria-invalid={errors.date ? 'true' : 'false'}
              aria-describedby="date-error"
              required
            />
          </label>
          <p id="date-error" className="field-error">
            {errors.date}
          </p>
        </div>
        <div className="field">
          <label>
            Час
            <input
              type="time"
              {...fieldProps('time')}
              aria-invalid={errors.time ? 'true' : 'false'}
              aria-describedby="time-error"
              required
            />
          </label>
          <p id="time-error" className="field-error">
            {errors.time}
          </p>
        </div>
      </div>
      <GuestsStepper
        value={formik.values.guests}
        onChange={(value) => formik.setFieldValue('guests', value)}
      />
      <label>
        Коментар
        <textarea
          {...fieldProps('comment')}
          maxLength={200}
          aria-describedby="comment-counter"
        />
      </label>
      <p id="comment-counter" className="counter">
        {comment.length} / 200
      </p>
      <div className="actions">
        <button type="submit" aria-disabled={isPending}>
          {isPending ? 'Надсилаємо…' : 'Забронювати'}
        </button>
        <button type="button" onClick={handleReset}>
          Очистити
        </button>
      </div>
      <p
        role="status"
        className={result?.ok === false ? 'status error' : 'status'}
      >
        {result?.message}
      </p>
    </form>
  )
}
