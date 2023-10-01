import Game from '../scenes/Game'
import { SPEED, STATS, ATTACK_SPEED } from '../utils'
import { Bar } from './Bar'

export class Player extends Phaser.GameObjects.Sprite {
  dataKey: string
  tintColor: number
  healthBar: Bar
  fatigueBar: Bar
  scene: Game
  constructor(scene: Game, dataKey: string, x: number, y: number) {
    super(scene, x, y, 'objects', 0)
    this.dataKey = dataKey
    this.scene = scene

    this.scene.data.events.on(
      `changedata-player-${this.dataKey}`,
      (_: any, value: any) => {
        this.healthBar?.update(value.health)
        this.fatigueBar?.update(value.fatigue)
      },
    )
    this.tintColor = 0xff5555

    this.healthBar = new Bar(this.scene, this.x - 16, this.y - 32, 32, 4, 'red')
    this.healthBar.hide()
    this.setGameData('health', 0)
    this.setGameData('fatigue', 0)
    this.setGameData('damage', 0)
    this.setGameData('color', 0x000000)
    this.setGameData('maxFatigue', 0)

    this.fatigueBar = new Bar(
      this.scene,
      this.x - 16,
      this.y - 28,
      32,
      4,
      'green',
    )
    this.fatigueBar.hide()
    this.setAlpha(0)

    this.scene.time.addEvent({
      repeat: -1,
      delay: 100 / SPEED,
      callback: () => this.tick(),
    })
  }

  tick() {
    if (this.alpha === 0) return
    if (this.getGameData().fatigue >= this.getGameData().maxFatigue) {
      this.setGameData('fatigue', this.getGameData().maxFatigue)
      const target = this.getTarget()
      if (target) {
        this.setGameData('fatigue', 0)
        this.attack(target)
      }
    } else {
      this.setGameData('fatigue', this.getGameData().fatigue + 1)
    }
  }

  getTarget = () => {
    const isEnemy = !!this.dataKey.match(/enemy/)
    const targets = (
      isEnemy
        ? this.scene.dungeonService!.players
        : this.scene.dungeonService!.enemies
    ).filter((f) => f.alpha)

    // if (!isEnemy && targets.length === 0)
    //   this.scene.dungeonService!.enemies.forEach((p) => p.spawn('slime'))
    return targets[0]!
  }

  spawn(type: string) {
    let { health, fatigue, damage, color } = STATS[type as keyof typeof STATS]
    this.setTintFill(color)
    this.setGameData('health', health)
    this.setGameData('fatigue', 0)
    this.setGameData('damage', damage)
    this.setGameData('color', color)
    this.setGameData('maxFatigue', fatigue)
    if (type === 'slime') {
      this.healthBar.setMax(health)
      this.fatigueBar.setMax(fatigue)
    }

    this.setAlpha(1)
  }

  attack(target: Player) {
    this.scene.tweens.add({
      targets: this,
      x: this.x + (this.x > 200 ? -20 : 20),
      duration: ATTACK_SPEED / SPEED,
      yoyo: true,
      onYoyo: () => {
        target.damage(this.getGameData()?.damage ?? 1)
      },
    })
  }

  getGameData = () => this.scene.data.get(`player-${this.dataKey}`)

  setGameData = (k: string, v: any) =>
    this.scene.data.set(`player-${this.dataKey}`, {
      ...this.getGameData(),
      [k]: v,
    })

  damage(n: number) {
    const health = this.getGameData().health
    this.setGameData('health', Math.max(0, health - n))
    this.setTintFill(0xffffff)
    this.scene.time.delayedCall(ATTACK_SPEED / SPEED / 2, () => {
      this.setTintFill(this.getGameData().color)
      if (health - n <= 0) this.die()
    })
  }

  die() {
    if (this.alpha === 0) return
    this.setGameData('health', 0)
    this.healthBar?.hide()
    this.fatigueBar?.hide()
    this.setAlpha(0)
    const isEnemy = !!this.dataKey.match(/enemy/)
    if (isEnemy) {
      if (Phaser.Math.RND.between(0, 1) === 0)
        this.scene.inventoryService?.dropLoot(this.x - 16, this.y - 32)
    }
  }
}
