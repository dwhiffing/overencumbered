export const OFFSET_Y = 290
export const OFFSET_X = 10
export const TILE_SIZE = 40
export const PORTRAIT_SIZE = 64
export const BAR_WIDTH = 76
export const BAR_HEIGHT = 16
export const PLAYER_UI_WIDTH = PORTRAIT_SIZE + BAR_WIDTH
export const ATTACK_SPEED = 200
export const SPEED = 2

export interface IPlayer {
  health: number
  maxHealth: number
  fatigue: number
  damage: number
  color: number
  maxFatigue: number
}

export interface IItem {
  key: string
  type: string
  x: number
  y: number
}
export const RECIPES = {
  potion: ['flask', 'slime'],
}

export const ITEMS = {
  flask: {
    width: 1,
    height: 1,
    color: 0xffffff,
  },
  slime: {
    width: 1,
    height: 1,
    color: 0xff5555,
  },
  potion: {
    width: 1,
    height: 1,
    color: 0xff0000,
  },
}

export const STATS = {
  archer: {
    damage: 1,
    health: 20,
    fatigue: 10,
    color: 0x55ff55,
  },
  mage: {
    damage: 1,
    health: 20,
    fatigue: 50,
    color: 0x5555ff,
  },
  knight: {
    damage: 2,
    health: 20,
    fatigue: 20,
    color: 0xff5555,
  },
  slime: {
    damage: 1,
    health: 20,
    fatigue: 30,
    color: 0xff5555,
  },
}

export const screenToTile = (v?: { x: number; y: number }) => {
  return {
    y: Math.floor(((v?.y ?? 0) - OFFSET_Y) / TILE_SIZE),
    x: Math.floor(((v?.x ?? 0) - OFFSET_X) / TILE_SIZE),
  }
}
