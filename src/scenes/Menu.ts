import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  music?: Phaser.Sound.BaseSound
  message?: string
  constructor() {
    super('MenuScene')
  }

  init(opts: any) {
    this.message = opts.message
  }

  create() {
    this.cameras.main.fadeFrom(1000, 0, 0, 0, true)
    this.add
      .text(210, 200, 'Overencumbered', { fontSize: '32pt' })
      .setAlign('center')
      .setOrigin(0.5)
    this.add
      .text(210, 400, this.message ?? '', { fontSize: '16pt' })
      .setAlign('center')
      .setOrigin(0.5)
    this.add
      .text(210, 600, 'Click to start', { fontSize: '16pt' })
      .setAlign('center')
      .setOrigin(0.5)
    this.input.keyboard.on('keydown-M', this.onToggleMute)
    this.input.once('pointerdown', this.start)
  }

  update() {}

  start = () => {
    this.cameras.main.fade(1000, 0, 0, 0, true, (a: any, b: number) => {
      if (b === 1) this.scene.start('GameScene')
    })
  }

  onToggleMute = () => {
    this.sound.volume = this.sound.volume > 0 ? 0 : 1
  }
}
