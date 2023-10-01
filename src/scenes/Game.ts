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
    this.uiService = new UIService(this)
    this.inventoryService = new InventoryService(this)
    this.dungeonService = new DungeonService(this)
  }

  destroy() {
    this.uiService?.destroy()
  }

  update() {}
}
