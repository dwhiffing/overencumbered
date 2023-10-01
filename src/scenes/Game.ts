import Phaser from 'phaser'
import UIService from '../services/UIService'
import InventoryService from '../services/InventoryService'
import DungeonService from '../services/DungeonService'

export default class Game extends Phaser.Scene {
  uiService?: UIService
  inventoryService?: InventoryService
  dungeonService?: DungeonService

  constructor() {
    super('GameScene')
  }

  create() {
    this.cameras.main.fadeFrom(1000, 0, 0, 0, true)
    this.uiService = new UIService(this)
    this.inventoryService = new InventoryService(this)
    this.dungeonService = new DungeonService(this)

    this.time.delayedCall(1500, () => {
      this.dungeonService?.nextRoom()

      this.time.addEvent({
        repeat: -1,
        delay: 1000,
        callback: () => this.dungeonService?.checkEnemies(),
      })
    })
  }

  gameover() {
    if (this.data.get('gameover')) return
    this.data.set('gameover', true)
    this.cameras.main.fade(1000, 0, 0, 0, true, (_: any, b: number) => {
      if (b === 1) this.scene.start('MenuScene', { message: 'Game over' })
    })
  }

  victory() {
    if (this.data.get('gameover')) return
    this.data.set('gameover', true)
    this.cameras.main.fade(1000, 0, 0, 0, true, (_: any, b: number) => {
      if (b === 1) this.scene.start('MenuScene', { message: 'Victory' })
    })
  }
  destroy() {
    this.uiService?.destroy()
  }

  update() {
    this.inventoryService?.update()
  }
}
