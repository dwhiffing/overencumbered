import { ITEMS, OFFSET_X, OFFSET_Y, TILE_SIZE } from '../utils'

export class Item extends Phaser.GameObjects.Sprite {
  dataKey: string
  itemKey?: string
  itemType?: string
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

  spawn(x: number, y: number, itemType?: string, itemKey?: string) {
    // TODO: width/height
    const stats = ITEMS[itemType as keyof typeof ITEMS]
    if (stats) this.setTintFill(stats.color)
    if (itemType) this.itemType = itemType
    if (itemKey) this.itemKey = itemKey
    this.setAlpha(1)
    this.moveToTilePosition(x, y)
  }

  select() {
    this.lastPosition = { x: this.x + 1, y: this.y + 1 }
  }

  deselect() {}

  putBack() {
    if (this.lastPosition) {
      this.setPosition(this.lastPosition.x, this.lastPosition.y)
    }
  }

  reset() {
    this.itemKey = undefined
    this.itemType = undefined
    this.lastPosition = undefined
    this.setAlpha(0).setPosition(-TILE_SIZE, -TILE_SIZE)
  }

  moveToTilePosition(x: number, y: number) {
    if (x < 0 || y < 0) {
      this.putBack()
      return
    }
    this.x = OFFSET_X + x * TILE_SIZE
    this.y = OFFSET_Y + y * TILE_SIZE
  }
}
