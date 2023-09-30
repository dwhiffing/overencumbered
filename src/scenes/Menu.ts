import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  music?: Phaser.Sound.BaseSound
  constructor() {
    super('MenuScene')
  }

  init(opts: any) { }

  create() {
    this.input.keyboard.on('keydown-M', this.onToggleMute)
    this.input.keyboard.addKey('Z').on('down', this.start)
    this.input.keyboard.addKey('Enter').on('down', this.start)
  }

  update() {
  }

  start = () => {
    this.scene.start('GameScene')
  }

  onToggleMute = () => {
    this.sound.volume = this.sound.volume > 0 ? 0 : 1
  }
}
