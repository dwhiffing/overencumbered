import Game from '../scenes/Game'

export default class UIService {
  scene: Game

  constructor(scene: Game) {
    this.scene = scene

    this.scene.input.keyboard.on('keydown-F', this.onFullScreen)
    this.scene.input.keyboard.on('keydown-M', this.onToggleMute)

  }

  destroy() {
    this.scene.input.keyboard.off('keydown-F', this.onFullScreen)
    this.scene.input.keyboard.off('keydown-M', this.onToggleMute)
  }


  onToggleMute = () => {
    this.scene.sound.volume = this.scene.sound.volume > 0 ? 0 : 1
  }

  onFullScreen = () => {
    this.scene.scale.startFullscreen()
  }

}
