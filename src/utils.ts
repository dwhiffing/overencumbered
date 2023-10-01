export const OFFSET_Y = 290
export const OFFSET_X = 10
export const TILE_SIZE = 40
export const PORTRAIT_SIZE = 64
export const BAR_WIDTH = 76
export const BAR_HEIGHT = 16
export const PLAYER_UI_WIDTH = PORTRAIT_SIZE + BAR_WIDTH
export const ATTACK_SPEED = 200
export const ITEM_TIMEOUT_DURATION = 10000
export const SPEED = 2

export interface IPlayer {
  health: number
  maxHealth: number
  fatigue: number
  damage: number
  experience: number
  level: number
  armor: number
  color: number
  maxFatigue: number
}

export interface IInventory {
  items: IItem[]
  openCells: number[][]
  availableCellCount: number
}

export interface IItem {
  key: string
  type: string
  x: number
  y: number
  timer?: number
}
export const LEVELS = {
  dungeon: {
    rooms: [
      ['red_slime', 'red_slime', 'red_slime'],
      ['red_slime', 'red_slime', 'red_slime'],
    ],
  },
  jungle: {
    rooms: [
      ['blue_slime', 'blue_slime', 'blue_slime'],
      ['blue_slime', 'blue_slime', 'blue_slime'],
    ],
  },
  desert: {
    rooms: [
      ['green_slime', 'green_slime', 'green_slime'],
      ['green_slime', 'green_slime', 'green_slime'],
    ],
  },
}
export const RECIPES = {
  health_potion: ['flask', 'red_slime'],
}

export const ITEMS = {
  armor: {
    width: 2,
    height: 3,
    color: 0xffffff,
    effects: {
      armor: 10,
    },
  },
  helmet: {
    width: 2,
    height: 2,
    color: 0xffffff,
    effects: {
      armor: 2,
    },
  },
  sword: {
    width: 1,
    height: 4,
    color: 0xffffff,
    effects: {
      damage: 10,
    },
  },
  flask: {
    width: 1,
    height: 1,
    color: 0xffffff,
  },
  red_slime: {
    width: 1,
    height: 1,
    color: 0xff5555,
  },
  green_slime: {
    width: 1,
    height: 1,
    color: 0x55ff55,
  },
  blue_slime: {
    width: 1,
    height: 1,
    color: 0x5555ff,
  },
  health_potion: {
    width: 1,
    height: 1,
    color: 0xff0000,
  },
}

const DEFAULT_PLAYER = {
  damage: 1,
  health: 1,
  armor: 0,
  experience: 0,
  level: 1,
  fatigue: 1,
  color: 0xffffff,
  drops: [],
}
export const STATS = {
  archer: {
    ...DEFAULT_PLAYER,
    damage: 5,
    health: 20,
    fatigue: 10,
    color: 0x55ff55,
  },
  mage: {
    ...DEFAULT_PLAYER,
    damage: 5,
    health: 20,
    fatigue: 50,
    color: 0x5555ff,
  },
  knight: {
    ...DEFAULT_PLAYER,
    damage: 2,
    health: 20,
    fatigue: 20,
    color: 0xff5555,
  },
  red_slime: {
    ...DEFAULT_PLAYER,
    damage: 3,
    health: 5,
    fatigue: 30,
    color: 0xff5555,
    drops: ['red_slime', 'flask'],
  },
  blue_slime: {
    ...DEFAULT_PLAYER,
    damage: 3,
    health: 20,
    fatigue: 30,
    color: 0x5555ff,
    drops: ['blue_slime', 'flask'],
  },
  green_slime: {
    ...DEFAULT_PLAYER,
    damage: 3,
    health: 20,
    fatigue: 30,
    color: 0x55ff55,
    drops: ['green_slime', 'flask'],
  },
}

export const screenToTile = (v?: { x: number; y: number }) => {
  const x = Math.floor(((v?.x ?? 0) - OFFSET_X) / TILE_SIZE)
  const y = Math.floor(((v?.y ?? 0) - OFFSET_Y) / TILE_SIZE)
  return { x, y }
}

export const INITIAL_CELLS = [
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
]

export const INITIAL_INV = {
  openCells: INITIAL_CELLS,
  // availableCellCount: 30,
  availableCellCount: 0,
  items: [],
}

export const TOOLTIP_WIDTH = 175
export const TOOLTIP_HEIGHT = 150

let n = 0
let c = 0
const d = 5
export const XP_LEVELS = new Array(100).fill('').map((_, i) => {
  n += c++ * d
  return n
})
