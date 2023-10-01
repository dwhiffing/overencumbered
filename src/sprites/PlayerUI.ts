import Game from '../scenes/Game'
import { Bar } from './Bar'
import { PLAYER_UI_WIDTH, PORTRAIT_SIZE, BAR_WIDTH, BAR_HEIGHT } from '../utils'

export class PlayerUI {
  scene: Game
  bg: Phaser.GameObjects.Rectangle
  constructor(scene: Game, x: number, y: number, key: string) {
    this.scene = scene

    this.bg = this.scene.add
      .rectangle(x, y, PLAYER_UI_WIDTH, PORTRAIT_SIZE, 0x000000)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.dungeonService?.uis.forEach((ui) => ui.deselect())
        this.select()
        this.scene.inventoryService?.setInventory(key)
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

    this.scene.add
      .rectangle(
        x + 2,
        y + 2,
        PORTRAIT_SIZE - 4,
        PORTRAIT_SIZE - 4,
        this.scene.data.values[`player-${key}`].color,
      )
      .setOrigin(0)

    const healthBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y,
      BAR_WIDTH,
      BAR_HEIGHT,
      'red',
    )

    const manaBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y + BAR_HEIGHT,
      BAR_WIDTH,
      BAR_HEIGHT,
      'blue',
    )

    const fatigueBar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y + BAR_HEIGHT * 2,
      BAR_WIDTH,
      BAR_HEIGHT,
      'green',
    )
    const d = this.scene.data.get(`player-${key}`)
    healthBar.setMax(d?.health ?? 0)
    fatigueBar.setMax(d?.maxFatigue ?? 0)
    healthBar.update(d?.health ?? 0)

    this.scene.data.events.on(`changedata-player-${key}`, (a: any, c: any) => {
      healthBar.update(c.health)
      fatigueBar.update(c.fatigue)
    })
  }

  update() {}

  select() {
    this.bg.setFillStyle(0xffffff)
  }

  deselect() {
    this.bg.setFillStyle(0x000000)
  }
}
