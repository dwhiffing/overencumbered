import Game from '../scenes/Game'
import { ITEMS, OFFSET_X, OFFSET_Y, screenToTile, TILE_SIZE } from '../utils'

export class Item extends Phaser.GameObjects.Sprite {
  dataKey: string
  scene: Game
  itemKey?: string
  itemType?: string
  isSelected?: boolean
  isOnGround?: boolean
  floatTween?: Phaser.Tweens.Tween
  clickOffset?: { x: number; y: number }
  lastPosition?: { x: number; y: number }
  tilePosition?: { x: number; y: number }
  constructor(scene: Game, dataKey: string, x: number, y: number) {
    super(scene, x, y, 'objects', 0)
    this.scene = scene
    this.dataKey = dataKey
    this.setOrigin(0)
      .setAlpha(0)
      .setInteractive()
      .on('pointerdown', (p: any) => {
        this.clickOffset = { x: p.x - this.x, y: p.y - this.y }
        if (this.isOnGround) {
          const s = this.scene.inventoryService
          if (s?.selectedItem?.itemKey === this.itemKey) return
          this.scene.time.delayedCall(50, () => s?.selectItem(this))
        }
      })

    this.setDepth(2)
    this.setTintFill(0xffff55)
  }

  spawn(itemType?: string, itemKey?: string) {
    const stats = ITEMS[itemType as keyof typeof ITEMS]
    if (stats) {
      this.setTintFill(stats.color)
      if (stats.width) {
        this.setScale(stats.width ?? 1, stats.height ?? 1)
      }
    }
    if (itemType) this.itemType = itemType
    if (itemKey) this.itemKey = itemKey
    this.setAlpha(1)
    this.isOnGround = true
  }

  select() {
    this.setDepth(3)
    this.setAlpha(1)
    this.floatTween?.stop()
    this.lastPosition = { x: this.x, y: this.y }
  }

  deselect() {
    this.setDepth(2)
  }

  putBack() {
    if (this.lastPosition) {
      this.setPosition(this.lastPosition.x, this.lastPosition.y)
    }
  }

  float() {
    if (this.floatTween && this.floatTween.isPlaying()) return
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 7,
      repeat: -1,
      yoyo: true,
      duration: 500,
    })
  }

  reset() {
    this.itemKey = undefined
    this.itemType = undefined
    this.lastPosition = undefined
    this.isOnGround = true
    this.setAlpha(0).setPosition(-TILE_SIZE, -TILE_SIZE)
  }

  moveToTilePosition(x: number, y: number) {
    if (x < 0 || y < 0) {
      this.putBack()
      return
    }
    this.x = OFFSET_X + x * TILE_SIZE
    this.y = OFFSET_Y + y * TILE_SIZE

    this.floatTween?.stop()
    this.isOnGround = false
    this.lastPosition = { x: this.x, y: this.y }
    this.tilePosition = screenToTile({ x: this.x, y: this.y })
  }
}
