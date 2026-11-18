# ЛР-6. Робота зі складними формами та валідація

## Порівняння з React Hook Form і Zod

Альтернативна версія використовує Formik 2.4.9 і Zod 4.6.7.
Основна версія — React Hook Form 7.92.0, @hookform/resolvers 7.0.7
і Zod 4.6.7. Схему Zod залишено без змін: кожна версія має власний
`bookingSchema.js`, який перевіряє дані у формі та в `api.js`.
Форма підписки лишилася без змін і не використовує Formik.

| React Hook Form | Відповідник у цій версії Formik                                                    |
| --------------- | ---------------------------------------------------------------------------------- |
| `register`      | `fieldProps`: `name`, `value`, `onBlur`, `onChange`; значення в `formik.values`    |
| `Controller`    | `formik.values.guests` і `formik.setFieldValue('guests', value)`                   |
| `useWatch`      | `formik.values.comment` для лічильника                                             |
| `handleSubmit`  | Власний обробник: `validateForm`, фокус першої помилки, `setTouched`, `submitForm` |
| `zodResolver`   | `validate`: `bookingSchema.safeParse`, перше повідомлення кожного поля з `issues`  |
| `reset`         | `formik.resetForm()`                                                               |

Після першого виходу з поля помилка видима через `touched`; наступні зміни
цього поля запускають перевірку. Зміна дати повторно перевіряє також час.
`useActionState` і `startTransition` відповідають за надсилання в обох
версіях; після успіху дія скидає поля, після відмови лишає значення.

### Розмір збірки

Результат `npm run build` від 18.11.2026, обидві версії з підпискою:

| Версія                |        JS |      gzip |
| --------------------- | --------: | --------: |
| React Hook Form + Zod | 353.69 kB | 109.25 kB |
| Formik + Zod          | 348.23 kB | 107.11 kB |

Це розміри всього JS застосунку з React, а не окремих бібліотек.

### Рендери під час введення імені

За структурою коду: у Formik кожна зміна `values.name` оновлює
`BookingForm`, а разом із ним і немемоізований `GuestsStepper`.
У React Hook Form ім'я неконтрольоване: звичайне введення до першого
виходу з поля не потребує рендеру `BookingForm`; компонент підписаний через
`useWatch` лише на коментар. Після валідації зміна `errors` може оновити
`BookingForm`, `Controller` і `GuestsStepper`. `App`, `SubscribeForm`
і `SubmitButton` не отримують стану бронювання.

Це пояснення за кодом; перевірку через React DevTools → Highlight updates
when components render потрібно виконати вручну перед захистом.

### Останні релізи

Перевірено 18.11.2026 за метаданими npm (`dist-tags.latest` і `time`):

| Бібліотека          | Остання версія | Дата релізу (UTC) | npm Versions                                                                                |
| ------------------- | -------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| Formik              | 2.4.9          | 10.11.2025        | [formik](https://www.npmjs.com/package/formik?activeTab=versions)                           |
| Zod                 | 4.6.7          | 12.10.2026        | [zod](https://www.npmjs.com/package/zod?activeTab=versions)                                 |
| React Hook Form     | 7.92.0         | 11.11.2026        | [react-hook-form](https://www.npmjs.com/package/react-hook-form?activeTab=versions)         |
| @hookform/resolvers | 7.0.7          | 17.11.2026        | [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers?activeTab=versions) |

Для наступного проєкту я обрав би React Hook Form і Zod.
`register` потребує менше коду для звичайних полів, а `Controller` підключає
власні контрольовані компоненти. `useWatch` дозволяє підписатися лише на
потрібне поле, тоді як тут Formik оновлює компонент усієї форми з кожним
символом імені. Невелика різниця розміру цієї збірки не переважає зручність
цих API; крім того, Formik має старішу дату останнього релізу.

Документація: [useFormik](https://formik.org/docs/api/useFormik),
[валідація Formik](https://formik.org/docs/guides/validation).

Стартовий проєкт лабораторної роботи № 6 курсу «Розробка вебзастосунків на
React»: форма бронювання столика з ЛР-5. Інструкція:
https://denysmatsevych.github.io/web-development-2026/react/labs/lab-6/

Форма працює так, як ви залишили її наприкінці ЛР-5, і перевіряє лише
обов'язкові поля (`required`). Ви опишете правила форми схемою Zod, передасте
значення полів React Hook Form, покажете повідомлення про помилки під полями
й надсилатимете бронювання на сервер через Action React 19.

## Що вже є

- форма з ЛР-5 (`src/components/BookingForm.jsx`) і контрольований
  `GuestsStepper`;
- нове поле «Телефон» і порожні абзаци для повідомлень про помилки під полями
  «Ім'я», «Телефон», «Дата» й «Час»;
- `src/api.js`: імітований сервер кав'ярні, який відповідає за секунду;
- `src/bookingSchema.js`: функції `today()` і `nowTime()` і порожня схема,
  яку ви заповните;
- стилі для повідомлень про помилки, стану очікування й форми підписки в
  `src/index.css`;
- бібліотеки `react-hook-form`, `zod` і `@hookform/resolvers` у
  `package.json`: `npm install` у корені встановить їх разом з іншими.

## Команди

`npm install` виконуйте в корені репозиторію `react-labs`, решту — у теці
`lab-6/`:

- `npm run dev`: dev-сервер на http://localhost:5173
- `npm run lint`: ESLint
- `npm run format:check`: перевірка форматування Prettier
- `npm run build`: production-збірка в `dist/`
