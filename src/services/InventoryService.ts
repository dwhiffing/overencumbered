import Game from "../scenes/Game";

// list of items in inventory
// used to determine stats of heroes
// used to determine what items the heroes can use
// used to determine what slots are open on the inventory
// used to determine what itemject sprites are displayed and where

export default class {
  scene: Game;
  map: Phaser.Tilemaps.Tilemap;
  selectedItem?: Item;
  items?: Item[];
  constructor(scene: Game) {
    this.scene = scene;
    const data = [];
    for (let y = 0; y < 10; y++) {
      data.push(new Array(10).fill(0));
    }

    this.scene.add
      .rectangle(
        0,
        OFFSET_Y - OFFSET_X,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height - OFFSET_Y + OFFSET_X,
        0x090909
      )
      .setOrigin(0);

    this.map = this.scene.make.tilemap({
      data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    this.map
      .createLayer(0, this.map.addTilesetImage("tiles"), OFFSET_X, OFFSET_Y)
      .setScale(1);

    const items = [
      { type: "orb", x: 0, y: 0 },
      { type: "orb", x: 1, y: 0 },
      { type: "orb", x: 2, y: 2 },
    ];
    this.scene.data.set("inventory", { items });

    this.items = new Array(20).fill("").map((_, i) => {
      const item = new Item(this.scene, 0, 0);
      this.scene.add.existing(item);
      return item;
    });

    this.scene.input.on("pointerdown", (p: any) => {
      if (this.selectedItem) {
        this.moveSelectedItem(p.x, p.y);
      } else {
        this.selectItem(this.items?.find((o) => o.isSelected)!);
      }
    });

    this.scene.input.on("pointermove", (p: any) => {
      if (this.selectedItem?.clickOffset) {
        this.selectedItem.x = p.x - this.selectedItem.clickOffset.x;
        this.selectedItem.y = p.y - this.selectedItem.clickOffset.y;
      }
    });

    this.render();
  }

  moveSelectedItem(x: number, y: number) {
    if (!this.selectedItem) return;
    this.moveItem(this.selectedItem, screenToTile({ x, y }));
    this.selectedItem = undefined;
  }

  moveItem(item: Item, newPos: { x: number; y: number }) {
    const isTileOccupied = this.getTile(newPos.x, newPos.y)?.index !== 0;
    if (!item) return;

    if (isTileOccupied) {
      item.putBack();
      return;
    }
    item.deselect();

    const oldPos = screenToTile(item.lastPosition);
    this.placeTile(oldPos.x, oldPos.y, 0);
    item.setAlpha(1);
    item.moveToTilePosition(newPos.x, newPos.y);
    this.placeTile(newPos.x, newPos.y, 1);
  }

  render() {
    if (!this.items) return;
    const inventory = this.scene.data.get("inventory");
    this.items?.forEach((o) =>
      o.setAlpha(0).setPosition(-TILE_SIZE, -TILE_SIZE)
    );
    inventory.items.forEach((o: Item, i: number) => {
      this.moveItem(this.items![i], o);
    });
  }

  selectItem = (item?: Item) => {
    if (item?.isSelected) this.selectedItem = item;
  };

  getTile = (x: number, y: number) => this.map.getTileAt(x, y);

  placeTile = (x: number, y: number, index: number) => {
    this.map.putTileAt(index, x, y);
    return true;
  };
}

class Item extends Phaser.GameObjects.Sprite {
  isSelected?: boolean;
  clickOffset?: { x: number; y: number };
  lastPosition?: { x: number; y: number };
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "objects", 0);
    this.setOrigin(0)
      .setAlpha(0)
      .setInteractive()
      .on("pointerdown", (p: any) => {
        this.clickOffset = { x: p.x - this.x, y: p.y - this.y };
        this.select();
      });
    this.setTintFill(0xff5555);
  }

  select() {
    if (this.isSelected) return;
    this.lastPosition = { x: this.x + 1, y: this.y + 1 };
    this.isSelected = true;
  }

  deselect() {
    this.isSelected = false;
  }

  putBack() {
    if (this.lastPosition) {
      this.setPosition(this.lastPosition.x, this.lastPosition.y);
    }
  }

  moveToTilePosition(x: number, y: number) {
    if (x < 0 || y < 0) {
      this.putBack();
      return;
    }
    this.x = OFFSET_X - 1 + x * TILE_SIZE;
    this.y = OFFSET_Y - 1 + y * TILE_SIZE;
  }
}
const OFFSET_Y = 290;
const OFFSET_X = 10;
const TILE_SIZE = 40;

const screenToTile = (v?: { x: number; y: number }) => {
  return {
    y: Math.floor(((v?.y ?? 0) - OFFSET_Y) / TILE_SIZE),
    x: Math.floor(((v?.x ?? 0) - OFFSET_X) / TILE_SIZE),
  };
};
