/**
 * Ред'юсер черги замовлень.
 *
 * Стан: { orders: [...] }. Кожне замовлення — як у src/data/orders.js:
 *   { id, number, status, customer: { id, name }, items: [...] }
 * status — колонка на дошці: 'new' («Нові»), 'brewing' («Готуються»),
 * 'ready' («Готові») або 'served' («Видані»).
 *
 * Дії — події на сторінці:
 *   { type: 'order_placed', order: { id, customer: { id, name }, items } }
 *       бариста надіслав нове замовлення з форми. Номер і статус 'new'
 *       дає ред'юсер, кожен напій отримує done: false. id замовлення й
 *       гостя створює обробник події.
 *   { type: 'item_toggled', orderId, itemId }
 *       бариста відмітив напій готовим або зняв позначку
 *   { type: 'order_advanced', orderId }
 *       бариста натиснув «Почати», «Готово» чи «Видати»: замовлення
 *       переходить у наступну колонку
 *   { type: 'order_cancelled', orderId }
 *       бариста натиснув «Скасувати замовлення»
 *   { type: 'customer_renamed', customerId, name }
 *       бариста виправив ім'я гостя в «Деталях»
 *
 * Компоненти й тести читають стан лише через selectColumn і selectOrder
 * унизу файлу.
 */

const nextStatus = { new: 'brewing', brewing: 'ready', ready: 'served' }

// Номер останнього замовлення. У стані його не тримаємо: номери лише
// ростуть, а номер скасованого замовлення новому не дістається.

/** Початковий стан черги з вкладених замовлень, як їх повертає loadOrders(). */
export function createInitialState(orders) {
  const lastNumber = Math.max(...orders.map((order) => order.number))
  return { orders, lastNumber }
}

export function queueReducer(state, action) {
  switch (action.type) {
    case 'order_placed': {
      const order = {
        ...action.order,
        number: state.lastNumber + 1,
        status: 'new',
        items: action.order.items.map((item) => ({ ...item, done: false })),
      }
      return {
        ...state,
        lastNumber: state.lastNumber + 1,
        orders: [...state.orders, order],
      }
    }
    case 'item_toggled':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                items: o.items.map((i) =>
                  i.id === action.itemId ? { ...i, done: !i.done } : i,
                ),
              }
            : o,
        ),
      }
    case 'order_advanced': {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? { ...order, status: nextStatus[order.status] }
            : order,
        ),
      }
    }
    case 'order_cancelled':
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.orderId),
      }
    case 'customer_renamed': {
      const order = state.orders.find(
        (o) => o.customer.id === action.customerId,
      )
      return {
        ...state,
        orders: state.orders.map((o) =>
          o === order
            ? { ...o, customer: { ...o.customer, name: action.name } }
            : o,
        ),
      }
    }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

/**
 * Замовлення однієї колонки (status) у порядку надходження, кожне разом із
 * гостем і напоями.
 */
export function selectColumn(state, status) {
  return state.orders.filter((order) => order.status === status)
}

/** Замовлення за id разом із гостем і напоями; undefined, якщо його немає. */
export function selectOrder(state, id) {
  return state.orders.find((order) => order.id === id)
}
