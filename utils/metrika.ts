import ym from 'react-yandex-metrika'

export const metrika = {
    eatOrder: () => ym('reachGoal', `eatOrder`),
    serviceOrder: () => ym('reachGoal', `serviceOrder`),
    review: () => ym('reachGoal', `review`),
    supportTicket: () => ym('reachGoal', `supportTicket`)
}