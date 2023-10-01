import Game from '../scenes/Game'

export class Bar {
  scene: Game | Phaser.Scene
  max: number
  value: number
  sprite: Phaser.GameObjects.Rectangle
  bg: Phaser.GameObjects.Rectangle
  constructor(
    scene: Game,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) {
    this.scene = scene
    this.max = 0
    this.value = 0
    const COLORS = {
      red: [0xff0000, 0x000000],
      green: [0x00ff00, 0x000000],
      blue: [0x0000ff, 0x000000],
    }

    this.bg = this.scene.add
      //@ts-ignore
      .rectangle(x, y, width, height, COLORS[color][1])
      .setOrigin(0)
    this.sprite = this.scene.add
      //@ts-ignore
      .rectangle(x + 1, y + 1, width - 2, height - 2, COLORS[color][0])
      .setOrigin(0)
  }
  setMax = (m: number) => {
    this.max = m
    this.show()
  }
  hide = () => {
    this.sprite.setAlpha(0)
    this.bg.setAlpha(0)
  }
  show = () => {
    this.sprite.setAlpha(1)
    this.bg.setAlpha(1)
  }
  update = (v: number) => {
    this.value = v
    this.sprite.setScale(v / this.max, 1)
  }
}
