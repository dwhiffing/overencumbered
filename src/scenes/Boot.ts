import Phaser from 'phaser'
import { DEBUG } from '../utils'

export default class Boot extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    const progress = this.add.graphics()
    const { width, height } = this.sys.game.config

    this.load.on('progress', (value: number) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, +height / 2, +width * value, 60)
    })

    const P = { frameWidth: 48, frameHeight: 48 }
    this.load.image('tiles', '/assets/tiles.png')
    this.load.spritesheet('portrait', '/assets/portraits.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet('red_slime', '/assets/red_slime.png', P)
    this.load.spritesheet('blue_slime', '/assets/blue_slime.png', P)
    this.load.spritesheet('green_slime', '/assets/green_slime.png', P)
    this.load.spritesheet('knight', '/assets/knight.png', P)
    this.load.spritesheet('archer', '/assets/archer.png', P)
    this.load.spritesheet('mage', '/assets/mage.png', P)
    this.load.spritesheet('objects', '/assets/objects.png', {
      frameWidth: 40,
      frameHeight: 40,
    })

    this.load.on('complete', () => {
      progress.destroy()

      this.scene.start(DEBUG ? 'GameScene' : 'MenuScene')
    })
  }

  create() {}
}
