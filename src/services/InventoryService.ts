import Game from '../scenes/Game'
import {
  IItem,
  OFFSET_X,
  OFFSET_Y,
  RECIPES,
  screenToTile,
  TILE_SIZE,
} from '../utils'
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
    this.addItem('flask', 0, 0)
    this.addItem('flask', 1, 0)
    this.addItem('flask', 2, 0)
    this.addItem('flask', 3, 0)
    this.addItem('flask', 4, 0)
    this.addItem('flask', 5, 0)
    this.addItem('slime', 0, 1)
    this.addItem('slime', 1, 1)
    this.addItem('slime', 2, 1)
    this.addItem('slime', 3, 1)
    this.addItem('slime', 4, 1)
    this.addItem('slime', 5, 1)
    // this.addItem('potion', 2, 0)

    this.items = new Array(30).fill('').map((_, i) => {
      const item = new Item(this.scene, `item-${i}`, 0, 0)
      this.scene.add.existing(item)
      return item
    })

    this.scene.input.on('pointerdown', (p: any) => {
      if (this.selectedItem) {
        this.moveSelectedItem(p.x, p.y)
      } else {
        this.selectItem(
          this.items
            ?.filter((i) => i.alpha)
            ?.find((o) => {
              const pos = screenToTile(p)
              const _pos = screenToTile(o)
              return _pos.x === pos.x && _pos.y === pos.y
            })!,
        )
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

  removeItem = (key: string) => {
    const inv = this.getInventory()
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      items: inv.items.filter((item: IItem) => item.key !== key),
    })
  }

  addItem = (itemType: string, x: number, y: number) => {
    const inv = this.getInventory()
    const key = `item-${Phaser.Math.RND.uuid()}`
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      items: [...inv.items, { key, type: itemType, x, y }],
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
      this.addItem('slime', pos.x, pos.y)
    }
    this.render()
    this.selectedItem = undefined
  }

  getInventory() {
    const inv = this.scene.data.get(`inventory-${this.inventoryKey}`) ?? {
      items: [],
    }
    return { ...inv, items: inv.items as IItem[] }
  }

  setActiveInventoryKey(key: string) {
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

  moveItem(
    item: Item,
    newPos: { x: number; y: number; key?: string; type?: string },
  ) {
    const isTileOccupied = this.getTile(newPos.x, newPos.y)?.index !== 0
    const existingItem = this.items?.find((i) => {
      const pos = screenToTile(i)
      return i !== item && pos.x === newPos.x && pos.y === newPos.y
    })
    if (!item) return

    if (isTileOccupied) {
      const validRecipe = Object.entries(RECIPES).find(
        ([key, [partA, partB]]) =>
          (item.itemType === partA && existingItem?.itemType === partB) ||
          (item.itemType === partB && existingItem?.itemType === partA),
      )
      if (validRecipe) {
        if (item.itemKey) this.removeItem(item.itemKey)
        if (existingItem?.itemKey) this.removeItem(existingItem.itemKey)
        const pos = screenToTile(existingItem)
        this.addItem(validRecipe[0], pos.x, pos.y)
        this.render()
      }
      item.putBack()
      return
    }
    item.deselect()

    const oldPos = screenToTile(item.lastPosition)
    this.placeTile(oldPos.x, oldPos.y, 0)

    item.spawn(newPos.x, newPos.y, newPos.type, newPos.key)

    this.placeTile(newPos.x, newPos.y, 1)
    const inventory = this.getInventory()
    const index = +item.dataKey.split('-')[1]

    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      items: inventory.items.map((_item: IItem, i: number) =>
        index !== i ? _item : { ..._item, ...newPos },
      ),
    })
  }

  render() {
    if (!this.items) return
    const inventory = this.getInventory()
    this.items?.forEach((o) => o.reset())
    this.map.fill(0)

    inventory.items.forEach((o: IItem, i: number) => {
      if (this.items?.[i]) this.moveItem(this.items[i], o)
    })
  }

  selectItem = (item?: Item) => {
    this.selectedItem = item
  }

  getTile = (x: number, y: number) => this.map.getTileAt(x, y)

  placeTile = (x: number, y: number, index: number) => {
    this.map.putTileAt(index, x, y)
    return true
  }
}
