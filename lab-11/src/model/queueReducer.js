/**
 * Ред'юсер черги замовлень.
 *
 * Стан:
 * {
 *   orders: {
 *     byId: { [id]: { id, number, status, customerId, items } },
 *     ids: [id, ...]
 *   },
 *   customers: {
 *     byId: { [id]: { id, name } },
 *     ids: [id, ...]
 *   },
 *   lastNumber
 * }
 *
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

/** Початковий стан черги з вкладених замовлень, як їх повертає loadOrders(). */
export function createInitialState(orders) {
  const lastNumber = Math.max(...orders.map((order) => order.number))

  const ordersById = {}
  const orderIds = []
  const customersById = {}
  const customerIds = []

  for (const order of orders) {
    orderIds.push(order.id)
    ordersById[order.id] = {
      id: order.id,
      number: order.number,
      status: order.status,
      customerId: order.customer.id,
      items: order.items,
    }

    if (!customersById[order.customer.id]) {
      customerIds.push(order.customer.id)
      customersById[order.customer.id] = { ...order.customer }
    }
  }

  return {
    orders: {
      byId: ordersById,
      ids: orderIds,
    },
    customers: {
      byId: customersById,
      ids: customerIds,
    },
    lastNumber,
  }
}

export function queueReducer(state, action) {
  switch (action.type) {
    case 'order_placed': {
      const nextNumber = state.lastNumber + 1
      const { id, customer, items } = action.order

      const newOrder = {
        id,
        number: nextNumber,
        status: 'new',
        customerId: customer.id,
        items: items.map((item) => ({ ...item, done: false })),
      }

      const customerExists = Boolean(state.customers.byId[customer.id])
      const nextCustomers = customerExists
        ? state.customers
        : {
            byId: {
              ...state.customers.byId,
              [customer.id]: customer,
            },
            ids: [...state.customers.ids, customer.id],
          }

      return {
        ...state,
        orders: {
          byId: {
            ...state.orders.byId,
            [id]: newOrder,
          },
          ids: [...state.orders.ids, id],
        },
        customers: nextCustomers,
        lastNumber: nextNumber,
      }
    }

    case 'item_toggled': {
      const targetOrder = state.orders.byId[action.orderId]
      const updatedOrder = {
        ...targetOrder,
        items: targetOrder.items.map((item) =>
          item.id === action.itemId ? { ...item, done: !item.done } : item,
        ),
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          byId: {
            ...state.orders.byId,
            [action.orderId]: updatedOrder,
          },
        },
      }
    }

    case 'order_advanced': {
      const targetOrder = state.orders.byId[action.orderId]
      const updatedOrder = {
        ...targetOrder,
        status: nextStatus[targetOrder.status],
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          byId: {
            ...state.orders.byId,
            [action.orderId]: updatedOrder,
          },
        },
      }
    }

    case 'order_cancelled': {
      const remainingOrdersById = { ...state.orders.byId }
      delete remainingOrdersById[action.orderId]

      return {
        ...state,
        orders: {
          byId: remainingOrdersById,
          ids: state.orders.ids.filter((id) => id !== action.orderId),
        },
      }
    }

    case 'customer_renamed': {
      return {
        ...state,
        customers: {
          ...state.customers,
          byId: {
            ...state.customers.byId,
            [action.customerId]: {
              ...state.customers.byId[action.customerId],
              name: action.name,
            },
          },
        },
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
  return state.orders.ids
    .map((id) => selectOrder(state, id))
    .filter((order) => order && order.status === status)
}

/** Замовлення за id разом із гостем і напоями; undefined, якщо його немає. */
export function selectOrder(state, id) {
  if (!id) return undefined
  const order = state.orders.byId[id]
  if (!order) return undefined

  return {
    ...order,
    customer: state.customers.byId[order.customerId],
  }
}
