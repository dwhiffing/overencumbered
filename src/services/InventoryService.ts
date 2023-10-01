import Game from '../scenes/Game'
import { OFFSET_X, OFFSET_Y, screenToTile, TILE_SIZE } from '../utils'
import { Item } from '../sprites/Item'

// list of items in inventory
// used to determine stats of heroes
// used to determine what items the heroes can use
// used to determine what slots are open on the inventory
// used to determine what itemject sprites are displayed and where

export default class {
  scene: Game
  map: Phaser.Tilemaps.Tilemap
  selectedItem?: Item
  inventoryKey?: string
  items?: Item[]
  constructor(scene: Game) {
    this.scene = scene
    const data = []
    for (let y = 0; y < 10; y++) {
      data.push(new Array(10).fill(0))
    }

    this.inventoryKey = 'player-0'

    this.scene.add
      .rectangle(
        0,
        OFFSET_Y - OFFSET_X,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height - OFFSET_Y + OFFSET_X,
        0x090909,
      )
      .setOrigin(0)

    this.map = this.scene.make.tilemap({
      data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    })
    this.map
      .createLayer(0, this.map.addTilesetImage('tiles'), OFFSET_X, OFFSET_Y)
      .setScale(1)

    this.scene.data.set(`inventory-player-0`, { items: [] })
    this.scene.data.set(`inventory-player-1`, { items: [] })
    this.scene.data.set(`inventory-player-2`, { items: [] })
    this.addItem('orb', 0, 0)
    this.addItem('orb', 1, 0)
    this.addItem('orb', 2, 0)

    this.items = new Array(30).fill('').map((_, i) => {
      const item = new Item(this.scene, `item-${i}`, 0, 0)
      this.scene.add.existing(item)
      return item
    })

    this.scene.input.on('pointerdown', (p: any) => {
      if (this.selectedItem) {
        this.moveSelectedItem(p.x, p.y)
      } else {
        this.selectItem(this.items?.find((o) => o.isSelected)!)
      }
    })

    this.scene.input.on('pointermove', (p: any) => {
      if (this.selectedItem?.clickOffset) {
        this.selectedItem.x = p.x - this.selectedItem.clickOffset.x
        this.selectedItem.y = p.y - this.selectedItem.clickOffset.y
      }
    })

    this.render()
  }

  addItem = (itemType: string, x: number, y: number) => {
    const thing = this.scene.data.get(`inventory-${this.inventoryKey}`) ?? []
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      items: [
        ...thing.items,
        {
          key: `item-${Phaser.Math.RND.uuid()}`,
          type: itemType ?? 'orb',
          x,
          y,
        },
      ],
    })
  }

  moveSelectedItem(x: number, y: number) {
    if (!this.selectedItem) return
    // if the selected item isnt in the inventory, we should add it instead of moving it.
    // we can tell because for items in the inventory, we will set an item key
    if (this.selectedItem.itemKey) {
      this.moveItem(this.selectedItem, screenToTile({ x, y }))
    } else {
      const pos = screenToTile({ x, y })
      this.addItem('orb', pos.x, pos.y)
      this.render()
    }
    this.selectedItem = undefined
  }

  setInventory(key: string) {
    this.inventoryKey = key
    this.render()
  }

  dropLoot(x: number, y: number) {
    const i = this.items?.find((i) => !i.alpha)
    i?.setAlpha(1)
    i?.setPosition(
      x + Phaser.Math.RND.between(-5, 5),
      y + Phaser.Math.RND.between(-5, 5),
    )
  }

  moveItem(item: Item, newPos: { x: number; y: number }, key?: string) {
    const isTileOccupied = this.getTile(newPos.x, newPos.y)?.index !== 0
    if (!item) return

    if (isTileOccupied) {
      item.putBack()
      return
    }
    item.deselect()

    const oldPos = screenToTile(item.lastPosition)
    this.placeTile(oldPos.x, oldPos.y, 0)
    item.setAlpha(1)
    if (key) item.itemKey = key
    item.moveToTilePosition(newPos.x, newPos.y)

    this.placeTile(newPos.x, newPos.y, 1)
    const inventory = this.scene.data.get(`inventory-${this.inventoryKey}`)
    const index = +item.dataKey.split('-')[1]

    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      items: inventory.items.map((_item: any, i: number) =>
        index !== i ? _item : { ..._item, ...newPos },
      ),
    })
  }

  render() {
    if (!this.items) return
    const inventory = this.scene.data.get(`inventory-${this.inventoryKey}`)
    this.items?.forEach((o) => {
      o.reset()
    })

    this.map.fill(0)

    inventory.items.forEach((o: any, i: number) => {
      this.moveItem(this.items![i], o, o.key)
    })
  }

  selectItem = (item?: Item) => {
    if (item?.isSelected) this.selectedItem = item
  }

  getTile = (x: number, y: number) => this.map.getTileAt(x, y)

  placeTile = (x: number, y: number, index: number) => {
    this.map.putTileAt(index, x, y)
    return true
  }
}
