import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '../bookingSchema.js'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import GuestsStepper from './GuestsStepper.jsx'
import { describeBooking } from '../describeBooking.js'

const defaultValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  comment: '',
}

export default function BookingForm() {
  const [booking, setBooking] = useState(null)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues,
  })
  const comment = useWatch({ control, name: 'comment' })

  function onValid(data) {
    setBooking(data)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    setFocus('name')
    reset()
    setBooking(null)
  }

  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={handleSubmit(onValid)}
      onKeyDown={handleKeyDown}
    >
      <div className="field">
        <label>
          Ім'я
          <input
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby="name-error"
            autoComplete="name"
            required
          />
        </label>
        <p id="name-error" className="field-error">
          {errors.name?.message}
        </p>
      </div>
      <div className="field">
        <label>
          Телефон
          <input
            type="tel"
            {...register('phone')}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby="phone-error"
            autoComplete="tel"
            placeholder="+380671234567"
            required
          />
        </label>
        <p id="phone-error" className="field-error">
          {errors.phone?.message}
        </p>
      </div>
      <div className="row">
        <div className="field">
          <label>
            Дата
            <input
              type="date"
              {...register('date', {
                onChange: () => {
                  if (getValues('time')) trigger('time')
                },
              })}
              aria-invalid={errors.date ? 'true' : 'false'}
              aria-describedby="date-error"
              required
            />
          </label>
          <p id="date-error" className="field-error">
            {errors.date?.message}
          </p>
        </div>
        <div className="field">
          <label>
            Час
            <input
              type="time"
              {...register('time')}
              aria-invalid={errors.time ? 'true' : 'false'}
              aria-describedby="time-error"
              required
            />
          </label>
          <p id="time-error" className="field-error">
            {errors.time?.message}
          </p>
        </div>
      </div>
      <Controller
        name="guests"
        control={control}
        render={({ field }) => (
          <GuestsStepper value={field.value} onChange={field.onChange} />
        )}
      />
      <label>
        Коментар
        <textarea
          {...register('comment')}
          maxLength={200}
          aria-describedby="comment-counter"
        />
      </label>
      <p id="comment-counter" className="counter">
        {comment.length} / 200
      </p>
      <div className="actions">
        <button type="submit">Забронювати</button>
        <button type="button" onClick={handleReset}>
          Очистити
        </button>
      </div>
      <p role="status" className="status">
        {booking && describeBooking(booking)}
      </p>
    </form>
  )
}
