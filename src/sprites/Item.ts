import { OFFSET_X, OFFSET_Y, TILE_SIZE } from '../utils'

export class Item extends Phaser.GameObjects.Sprite {
  dataKey: string
  itemKey?: string
  isSelected?: boolean
  clickOffset?: { x: number; y: number }
  lastPosition?: { x: number; y: number }
  constructor(scene: Phaser.Scene, dataKey: string, x: number, y: number) {
    super(scene, x, y, 'objects', 0)
    this.dataKey = dataKey
    this.setOrigin(0)
      .setAlpha(0)
      .setInteractive()
      .on('pointerdown', (p: any) => {
        this.clickOffset = { x: p.x - this.x, y: p.y - this.y }
        this.select()
      })
    this.setTintFill(0xffff55)
  }

  select() {
    if (this.isSelected) return
    this.lastPosition = { x: this.x + 1, y: this.y + 1 }
    this.isSelected = true
  }

  deselect() {
    this.isSelected = false
  }

  putBack() {
    if (this.lastPosition) {
      this.setPosition(this.lastPosition.x, this.lastPosition.y)
    }
  }

  reset() {
    this.itemKey = undefined
    this.setAlpha(0).setPosition(-TILE_SIZE, -TILE_SIZE)
  }

  moveToTilePosition(x: number, y: number) {
    if (x < 0 || y < 0) {
      this.putBack()
      return
    }
    this.x = OFFSET_X - 1 + x * TILE_SIZE
    this.y = OFFSET_Y - 1 + y * TILE_SIZE
  }
}
