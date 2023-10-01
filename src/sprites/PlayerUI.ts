import Game from '../scenes/Game'
import { Bar } from './Bar'
import {
  PLAYER_UI_WIDTH,
  PORTRAIT_SIZE,
  BAR_WIDTH,
  BAR_HEIGHT,
  IPlayer,
  XP_LEVELS,
} from '../utils'

export class PlayerUI {
  scene: Game
  bg: Phaser.GameObjects.Rectangle
  bars: Bar[]
  xpBar: Bar
  portrait: Phaser.GameObjects.Rectangle
  healthBar: Bar
  manaBar: Bar
  fatigueBar: Bar
  key: string
  isActive: boolean
  constructor(scene: Game, x: number, y: number, key: string) {
    this.scene = scene

    this.key = key
    this.isActive = false
    this.bg = this.scene.add
      .rectangle(x, y, PLAYER_UI_WIDTH, PORTRAIT_SIZE, 0x000000)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.dungeonService?.uis.forEach((ui) => ui.deselect())
        if (this.isActive) this.select()
        this.scene.inventoryService?.setActiveInventoryKey(this.key)
      })

    this.scene.add
      .rectangle(
        x + PORTRAIT_SIZE,
        y,
        PLAYER_UI_WIDTH - PORTRAIT_SIZE,
        PORTRAIT_SIZE,
        0x000000,
      )
      .setOrigin(0)

    this.portrait = this.scene.add
      .rectangle(
        x + 2,
        y + 2,
        PORTRAIT_SIZE - 4,
        PORTRAIT_SIZE - 4,
        this.scene.data.values[`player-${key}`].color,
      )
      .setOrigin(0)

    this.healthBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y,
      BAR_WIDTH,
      BAR_HEIGHT,
      'red',
    )

    this.manaBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y + BAR_HEIGHT,
      BAR_WIDTH,
      BAR_HEIGHT,
      'blue',
    )

    this.fatigueBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y + BAR_HEIGHT * 2,
      BAR_WIDTH,
      BAR_HEIGHT,
      'green',
    )

    this.xpBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y + BAR_HEIGHT * 3,
      BAR_WIDTH,
      BAR_HEIGHT,
      'cyan',
    )
    this.bars = [this.healthBar, this.manaBar, this.fatigueBar, this.xpBar]
    this.setupListeners(key)
    this.hide()
  }

  setupListeners(key: string) {
    this.scene.data.events.off(`changedata-player-${this.key}`, this.update)
    this.key = key
    this.portrait.setFillStyle(this.scene.data.values[`player-${key}`].color)
    this.scene.data.events.on(`changedata-player-${key}`, this.update)
    const d = this.scene.data.get(`player-${key}`)
    this.healthBar.setMax(d?.health ?? 0)
    this.fatigueBar.setMax(d?.maxFatigue ?? 0)
    this.xpBar.setMax(XP_LEVELS[1])
    this.xpBar.update(0)
    this.healthBar.update(d?.health ?? 0)
  }

  update = (a: any, c: IPlayer) => {
    this.healthBar.update(c.health)
    this.fatigueBar.update(c.fatigue)
    this.xpBar.setMax(XP_LEVELS[c.level])
    this.xpBar.update(c.experience - XP_LEVELS[c.level - 1])
  }

  hide() {
    this.isActive = false
    this.bars.forEach((b) => b.hide())
  }

  show() {
    this.isActive = true
    this.bars.forEach((b) => b.show())
  }

  select() {
    this.bg.setFillStyle(0xffffff)
  }

  deselect() {
    this.bg.setFillStyle(0x000000)
  }
}
