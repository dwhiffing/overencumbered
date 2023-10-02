export const DEBUG = false
export const OFFSET_Y = 290
export const OFFSET_X = 10
export const TILE_SIZE = 40
export const PORTRAIT_SIZE = 64
export const BAR_WIDTH = 76
export const BAR_HEIGHT = 16
export const PLAYER_UI_WIDTH = PORTRAIT_SIZE + BAR_WIDTH
export const ATTACK_SPEED = 350
export const ITEM_TIMEOUT_DURATION = 10000
export const SPEED = DEBUG ? 4 : 1

export interface IPlayer {
  health: number
  maxHealth: number
  fatigue: number
  damage: number
  experience: number
  level: number
  armor: number
  flipX: boolean
  texture: string
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
      ['red_slime'],
      ['red_slime'],
      ['red_slime', 'red_slime'],
      ['red_slime', 'red_slime', 'red_slime'],
      ['red_slime', 'red_slime', 'red_slime'],
      ['red_slime', 'red_slime', 'red_slime'],
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
    frame: 0,
    effects: {
      armor: 10,
    },
  },
  helmet: {
    width: 2,
    height: 2,
    frame: 0,
    color: 0xffffff,
    effects: {
      armor: 2,
    },
  },
  sword: {
    width: 1,
    height: 4,
    frame: 0,
    color: 0xffffff,
    effects: {
      damage: 10,
    },
  },
  flask: {
    width: 1,
    height: 1,
    frame: 0,
    color: 0xffffff,
  },
  red_slime: {
    width: 1,
    height: 1,
    frame: 9,
    color: 0xff5555,
  },
  green_slime: {
    width: 1,
    height: 1,
    frame: 8,
    color: 0x55ff55,
  },
  blue_slime: {
    width: 1,
    height: 1,
    frame: 10,
    color: 0x5555ff,
  },
  health_potion: {
    width: 1,
    height: 1,
    frame: 1,
    color: 0xff0000,
  },
}

const DEFAULT_PLAYER = {
  damage: 1,
  health: 10,
  armor: 0,
  experience: 0,
  level: 1,
  flipX: false,
  texture: 'knight',
  fatigue: 25,
  color: 0xffffff,
  drops: [],
}
export const STATS = {
  archer: {
    ...DEFAULT_PLAYER,
    texture: 'archer',
  },
  mage: {
    ...DEFAULT_PLAYER,
    texture: 'mage',
  },
  knight: {
    ...DEFAULT_PLAYER,
    damage: 1,
    health: 10,
    fatigue: 25,
    texture: 'knight',
  },
  red_slime: {
    ...DEFAULT_PLAYER,
    damage: 1,
    health: 3,
    fatigue: 50,
    texture: 'red_slime',
    flipX: true,
    color: 0xff3333,
    drops: ['red_slime', 'flask'],
  },
  blue_slime: {
    ...DEFAULT_PLAYER,
    damage: 3,
    health: 2000,
    fatigue: 30,
    texture: 'blue_slime',
    flipX: true,
    color: 0x5555ff,
    drops: ['blue_slime', 'flask'],
  },
  green_slime: {
    ...DEFAULT_PLAYER,
    damage: 3,
    health: 20,
    fatigue: 30,
    texture: 'green_slime',
    flipX: true,
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
  [4, 4],
  [5, 4],
  [4, 5],
  [5, 5],
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

export const ANIMS = {
  'knight-idle': { frames: [0, 5], frameRate: 10, repeat: -1 },
  'knight-attack': { frames: [32, 37], frameRate: 12, repeat: 0 },
  'knight-dead': { frames: [96, 104], frameRate: 12, repeat: 0 },
  'knight-hit': { frames: [88, 95], frameRate: 12, repeat: 0 },
  'mage-idle': { frames: [0, 5], frameRate: 12, repeat: -1 },
  'mage-attack': { frames: [24, 32], frameRate: 12, repeat: 0 },
  'mage-dead': { frames: [64, 72], frameRate: 12, repeat: 0 },
  'mage-hit': { frames: [76, 87], frameRate: 12, repeat: 0 },
  'archer-idle': { frames: [0, 6], frameRate: 12, repeat: -1 },
  'archer-attack': { frames: [40, 45], frameRate: 12, repeat: 0 },
  'archer-dead': { frames: [72, 79], frameRate: 12, repeat: 0 },
  'archer-hit': { frames: [64, 68], frameRate: 12, repeat: 0 },
  'green_slime-idle': { frames: [36, 39], frameRate: 6, repeat: -1 },
  'red_slime-idle': { frames: [36, 39], frameRate: 6, repeat: -1 },
  'blue_slime-idle': { frames: [36, 39], frameRate: 6, repeat: -1 },
  'green_slime-hit': { frames: [9, 12], frameRate: 12, repeat: 0 },
  'red_slime-hit': { frames: [9, 12], frameRate: 12, repeat: 0 },
  'blue_slime-hit': { frames: [9, 12], frameRate: 12, repeat: 0 },
  'green_slime-revive': { frames: [8, 2], frameRate: 12, repeat: 0 },
  'red_slime-revive': { frames: [8, 2], frameRate: 12, repeat: 0 },
  'blue_slime-revive': { frames: [8, 2], frameRate: 12, repeat: 0 },
  'green_slime-dead': { frames: [0, 8], frameRate: 12, repeat: 0 },
  'red_slime-dead': { frames: [0, 8], frameRate: 12, repeat: 0 },
  'blue_slime-dead': { frames: [0, 8], frameRate: 12, repeat: 0 },
  'green_slime-attack': { frames: [27, 31], frameRate: 12, repeat: 0 },
  'red_slime-attack': { frames: [27, 31], frameRate: 12, repeat: 0 },
  'blue_slime-attack': { frames: [27, 31], frameRate: 12, repeat: 0 },
}
