import Game from '../scenes/Game'
import {
  IInventory,
  IItem,
  INITIAL_INV,
  ITEMS,
  ITEM_TIMEOUT_DURATION,
  OFFSET_X,
  OFFSET_Y,
  RECIPES,
  screenToTile,
  TILE_SIZE,
  TOOLTIP_HEIGHT,
  TOOLTIP_WIDTH,
} from '../utils'
import { Item } from '../sprites/Item'

// list of items in inventory
// used to determine stats of heroes
// used to determine what items the heroes can use
// used to determine what slots are open on the inventory
// used to determine what itemject sprites are displayed and where

let n = -1
export default class {
  scene: Game
  map: Phaser.Tilemaps.Tilemap
  tooltip: Phaser.GameObjects.Container
  selectedItem?: Item
  inventoryKey?: string
  items?: Item[]
  groundItems?: Item[]
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

    this.scene.data.set(`ground-items`, [])
    this.scene.data.set(`inventory-player-0`, INITIAL_INV)
    this.scene.data.set(`inventory-player-1`, INITIAL_INV)
    this.scene.data.set(`inventory-player-2`, INITIAL_INV)
    // TODO
    // this.addItem('sword')
    // this.addItem('helmet')

    this.tooltip = this.scene.add
      .container(100, 100, [
        this.scene.add
          .rectangle(0, 0, TOOLTIP_WIDTH, TOOLTIP_HEIGHT, 0x000000)
          .setAlpha(0.8)
          .setOrigin(0),
        this.scene.add
          .text(5, 5, '')
          .setLineSpacing(10)
          .setFixedSize(TOOLTIP_WIDTH - 10, TOOLTIP_HEIGHT - 10),
      ])
      .setDepth(10)
      .setAlpha(0)

    this.groundItems = new Array(50).fill('').map((_, i) => {
      const item = new Item(this.scene, `item-${i}`, 0, 0)
      this.scene.add.existing(item)
      return item
    })

    this.items = new Array(50).fill('').map((_, i) => {
      const item = new Item(this.scene, `item-${i}`, 0, 0)
      this.scene.add.existing(item)
      return item
    })

    this.scene.input.on('pointerdown', (p: any) => {
      if (this.selectedItem) {
        this.moveSelectedItem(p.x, p.y)
      } else {
        const clickedItem = this.getClickedItem(p)
        if (clickedItem) {
          this.selectItem(clickedItem)
        } else {
          const pos = screenToTile(p)
          if (this.getTile(pos.x, pos.y)?.index === 3) {
            this.unlockTile(pos.x, pos.y)
          }
        }
      }
    })

    this.scene.input.on('pointermove', (p: any) => {
      const hoveredItem = this.getClickedItem(p)
      if (hoveredItem) {
        this.hoverItem(hoveredItem)
      } else {
        this.hideTooltip()
      }
      if (this.selectedItem?.clickOffset) {
        this.selectedItem.x = p.x - this.selectedItem.clickOffset.x
        this.selectedItem.y = p.y - this.selectedItem.clickOffset.y
      }
    })

    this.renderInventory()
  }

  moveToolTip = (x: number, y: number, text?: string) => {
    if (y > this.scene.cameras.main.height - TOOLTIP_HEIGHT) y -= TOOLTIP_HEIGHT
    if (x > this.scene.cameras.main.width - TOOLTIP_WIDTH) x -= TOOLTIP_WIDTH
    this.scene.tweens.add({
      targets: this.tooltip,
      x,
      y,
      duration: 250,
      alpha: 1,
      ease: Phaser.Math.Easing.Quadratic.Out,
    })
    // @ts-ignore
    if (text) this.tooltip.list[1].text = text
  }

  hideTooltip = () => {
    this.scene.tweens.add({
      targets: this.tooltip,
      alpha: 0,
      duration: 250,
      ease: Phaser.Math.Easing.Quadratic.Out,
    })
    // @ts-ignore
    this.tooltip.list[1].text = ''
  }

  getClickedItem = (p: any) => {
    const pos = screenToTile(p)
    return [...this.items!, ...this.groundItems!]
      ?.filter((i) => i.alpha)
      ?.find((o) => {
        const itemTiles = this.getItemTiles(o)
        return itemTiles.some((it) => it.x === pos.x && it.y === pos.y)
      })
  }

  getItemTiles = (item: Item) => {
    const _pos = item.tilePosition ?? screenToTile({ x: item.x, y: item.y })
    const stats = ITEMS[item.itemType as keyof typeof ITEMS]
    return this.map.getTilesWithin(
      _pos.x,
      _pos.y,
      stats?.width ?? 1,
      stats?.height ?? 1,
    )
  }

  removeItem = (key: string) => {
    const inv = this.getInventory()
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      ...inv,
      items: inv.items.filter((item: IItem) => item.key !== key),
    })
  }

  getInventoryStats = (key: string) => {
    let damage = this.getInventoryStat(key, 'damage')
    let armor = this.getInventoryStat(key, 'armor')
    return { damage, armor }
  }

  getInventoryStat = (key: string, stat: string) => {
    const inv = this.getInventory(key)
    return inv.items.reduce((sum, item) => {
      const stats = ITEMS[item.type as keyof typeof ITEMS] as any
      return stats.effects ? sum + (stats.effects[stat] ?? 0) : sum
    }, 0)
  }

  unlockTile = (x: number, y: number) => {
    const inv = this.getInventory()
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      ...inv,
      openCells: [...inv.openCells, [x, y]],
      availableCellCount: inv.availableCellCount - 1,
    })
    this.renderInventory()
  }

  isSlotOpen = (x: number, y: number, width: number, height: number) => {
    let result = true
    for (let _x = x; _x < x + width; _x++) {
      for (let _y = y; _y < y + height; _y++) {
        if (this.getTile(_x, _y).index !== 0) result = false
      }
    }
    return result
  }

  getOpenSlot = (width = 1, height = 1) => {
    const cell = this.getInventory().openCells.find(([x, y]: number[]) =>
      this.isSlotOpen(x, y, width, height),
    )
    if (cell) return { x: cell[0], y: cell[1] }
  }

  addItem = (
    itemType: string,
    x?: number,
    y?: number,
    existingItemKey?: string,
  ) => {
    const stats = ITEMS[itemType as keyof typeof ITEMS]
    const inv = this.getInventory()
    const key = `item-${Phaser.Math.RND.uuid()}`
    if (!x || !y || !this.isSlotOpen(x, y, stats.width, stats.height)) {
      const openSlot = this.getOpenSlot(stats.width, stats.height)
      if (openSlot) {
        x = openSlot.x
        y = openSlot.y
      }
    }
    if (x && y) {
      this.map.fill(1, x, y, stats.width ?? 1, stats.height ?? 1)
      if (existingItemKey) this.removeGroundItem(existingItemKey)
      this.scene.data.set(`inventory-${this.inventoryKey}`, {
        ...inv,
        items: [...inv.items, { key, type: itemType, x, y }],
      })
    }
  }

  moveSelectedItem(x: number, y: number) {
    if (!this.selectedItem) return
    // if the selected item isnt in the inventory, we should add it instead of moving it.
    // we can tell because for items in the inventory, we will set an item key
    if (!this.selectedItem.isOnGround) {
      let pos = screenToTile({ x, y })
      const offsetX = Math.floor(
        (this.selectedItem.clickOffset?.x ?? 0) / TILE_SIZE,
      )
      const offsetY = Math.floor(
        (this.selectedItem.clickOffset?.y ?? 0) / TILE_SIZE,
      )
      this.moveItem(this.selectedItem, {
        x: pos.x - offsetX,
        y: pos.y - offsetY,
      })
    } else {
      const pos = screenToTile({ x, y })
      const tile = this.getTile(pos.x, pos.y)
      const key = this.selectedItem.itemKey!
      const type = this.selectedItem.itemType!
      const stats = ITEMS[this.selectedItem.itemType as keyof typeof ITEMS]
      const open = this.getOpenSlot(stats.width, stats.height)
      if (!tile) {
        this.moveGroundItem(key, x, y)
      } else if (open) {
        this.addItem(type, pos.x, pos.y, key)
      } else {
        this.selectedItem.putBack()
      }
    }
    this.deselect()
    this.renderGround()
    this.renderInventory()
  }

  deselect = () => {
    this.selectedItem = undefined
  }

  getInventory(key?: string) {
    const inv = this.scene.data.get(
      `inventory-${key ?? this.inventoryKey}`,
    ) ?? {
      items: [],
    }
    return { ...inv, items: inv.items } as IInventory
  }

  setActiveInventoryKey(key: string) {
    this.inventoryKey = key
    this.renderInventory()
  }

  dropLoot(x: number, y: number, options: string[]) {
    const type = Phaser.Math.RND.pick(options)
    this.scene.data.values['ground-items'].push({
      type,
      key: Phaser.Math.RND.uuid(),
      // x: (++n % 20) * 20,
      // y: Math.floor(n / 20) * 20,
      x: x + Phaser.Math.RND.between(-20, 20),
      y: y,
      timer: this.scene.time.now + ITEM_TIMEOUT_DURATION,
    })

    this.renderGround()
  }

  moveItem(
    item: Item,
    newPos: { x: number; y: number; key?: string; type?: string },
  ) {
    if (newPos.y < 0) return this.dropItem(item)

    const existingItem = this.items?.find((i) => {
      const pos = screenToTile(i)
      return (
        i.itemKey !== item.itemKey &&
        i !== this.selectedItem &&
        pos.x === newPos.x &&
        pos.y === newPos.y
      )
    })
    const stats = ITEMS[(newPos.type ?? item.itemType) as keyof typeof ITEMS]
    const isTileOccupied = !!existingItem

    const itemTiles = this.getItemTiles(item)
    const tiles = this.map.getTilesWithin(
      newPos.x,
      newPos.y,
      stats?.width ?? 1,
      stats?.height ?? 1,
    )

    const canFit = tiles.every((t) => {
      const isEmpty = this.getTile(t.x, t.y)?.index === 0
      const isPartOfIncomingItem = itemTiles.some(
        (it) => it.x === t.x && it.y === t.y,
      )
      return isEmpty || isPartOfIncomingItem
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
        this.renderInventory()
        this.addItem(validRecipe[0], pos.x, pos.y)
        this.renderInventory()
      }
    }

    if (isTileOccupied || !canFit) {
      item.putBack()

      return
    }

    item.deselect()

    if (item.lastPosition) {
      const oldPos = screenToTile(item.lastPosition)
      this.placeTile(oldPos.x, oldPos.y, 0)
    }

    item.spawn(newPos.type, newPos.key)
    item.moveToTilePosition(newPos.x, newPos.y)

    this.map.fill(1, newPos.x, newPos.y, stats.width ?? 1, stats.height ?? 1)

    const inventory = this.getInventory()
    this.scene.data.set(`inventory-${this.inventoryKey}`, {
      ...inventory,
      items: inventory.items.map((_item: IItem) =>
        item.itemKey !== _item.key ? _item : { ..._item, ...newPos },
      ),
    })
  }

  renderInventory = () => {
    if (!this.items) return
    const inventory = this.getInventory()
    this.items.forEach((o) => o.reset())
    this.map.fill(2)
    inventory.openCells.forEach(([x, y]: number[]) => {
      this.placeTile(x, y, 0)
      const neighbours = [
        this.getTile(x - 1, y),
        this.getTile(x + 1, y),
        this.getTile(x, y - 1),
        this.getTile(x, y + 1),
      ]
      if (inventory.availableCellCount > 0)
        neighbours.forEach((t) => {
          if (t && t.index !== 0) this.placeTile(t.x, t.y, 3)
        })
    })
    inventory.items.forEach((o: IItem, i: number) => {
      const item =
        this.items!.find((i) => i.lastItemKey === o.key) ?? this.items![i]
      if (item) this.moveItem(item, o)
    })
  }

  renderGround = () => {
    if (!this.groundItems) return
    const items = this.groundItems.filter((i) => i !== this.selectedItem)
    items.forEach((o) => o.reset())

    const groundItems = this.scene.data.get('ground-items') as IItem[]
    const sorted = groundItems.sort((a, b) => {
      const aHas = items!.find((i) => i.lastItemKey === a.key)
      const bHas = items!.find((i) => i.lastItemKey === b.key)
      if ((aHas && bHas) || (!aHas && !bHas)) return 0
      if (aHas) return 1
      return -1
    })
    sorted.forEach((o: IItem, i: number) => {
      const item =
        items!.find((i) => i.lastItemKey === o.key) ??
        items!.find((i) => !i.lastItemKey)
      if (!item) return
      item.spawn(o.type, o.key)
      item.setPosition(o.x, o.y)
      item.float()
    })
  }

  selectItem = (item?: Item) => {
    if (!item) return

    this.hideTooltip()
    item.select()
    this.selectedItem = item
  }

  hoverItem = (item?: Item) => {
    if (!item || this.selectedItem) return
    const stats = ITEMS[item.itemType as keyof typeof ITEMS] as any
    if (!stats) return

    this.moveToolTip(
      item.x + 5,
      item.y - TOOLTIP_HEIGHT - 5,
      Object.entries({ key: item.itemType, ...(stats.effects ?? {}) }).reduce(
        (string, [k, v]) => string + `${k}: ${v}\n`,
        '',
      ),
    )
  }

  moveGroundItem = (itemKey: string, x: number, y: number) => {
    this.scene.data.values['ground-items'] = this.scene.data.values[
      'ground-items'
    ].map((i: IItem) =>
      i.key === this.selectedItem?.itemKey
        ? {
            ...i,
            x: x - TILE_SIZE / 2,
            y: y - TILE_SIZE / 2,
            timer: this.scene.time.now + ITEM_TIMEOUT_DURATION,
          }
        : i,
    )
  }

  removeGroundItem = (itemKey: string) => {
    this.scene.data.values['ground-items'] = this.scene.data.values[
      'ground-items'
    ].filter((i: IItem) => i.key !== itemKey)
  }

  dropItem = (item: Item) => {
    const _item = this.getInventory().items.find((i) => i.key === item.itemKey)!
    if (_item) {
      this.scene.data.values['ground-items'].push({
        ..._item,
        x: item.x,
        y: item.y,
        timer: this.scene.time.now + ITEM_TIMEOUT_DURATION,
      })
      this.removeItem(_item.key)
    }
  }

  getTile = (x: number, y: number) => this.map.getTileAt(x, y)

  placeTile = (x: number, y: number, index: number) => {
    this.map.putTileAt(index, x, y)
    return true
  }

  update() {
    this.items?.forEach((i) => i.update())
    this.groundItems?.forEach((i) => i.update())
  }
}
