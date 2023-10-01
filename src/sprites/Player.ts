import Game from '../scenes/Game'
import { SPEED, STATS, ATTACK_SPEED, IPlayer, IItem } from '../utils'
import { Bar } from './Bar'

export class Player extends Phaser.GameObjects.Sprite {
  dataKey: string
  playerType?: string
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
      (_: any, value: IPlayer) => {
        this.healthBar?.update(value.health)
        this.fatigueBar?.update(value.fatigue)
      },
    )
    this.tintColor = 0xff5555

    this.healthBar = new Bar(this.scene, this.x - 16, this.y - 32, 32, 4, 'red')
    this.healthBar.hide()
    this.setGameData('health', 0)
    this.setGameData('maxHealth', 0)
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
      this.takeAction()
    } else {
      this.setGameData('fatigue', this.getGameData().fatigue + 1)
    }
  }

  getItem = (itemType: string) => {
    const inventory = this.scene.data.get(`inventory-${this.dataKey}`) as {
      items: IItem[]
    }

    return inventory?.items?.find((i: IItem) => i.type === itemType)
  }

  usePotion = (potion: IItem) => {
    this.scene.inventoryService?.removeItem(potion.key)
    this.scene.inventoryService?.render()
    this.setGameData('health', this.getGameData().maxHealth)
  }

  takeAction = () => {
    this.setGameData('fatigue', this.getGameData().maxFatigue)

    const healthThreshold = this.getGameData().maxHealth / 2
    const potion = this.getItem('potion')
    if (this.getGameData().health <= healthThreshold && potion) {
      this.usePotion(potion)
    } else {
      this.attackIfValidTarget()
    }
  }

  attackIfValidTarget = () => {
    const target = this.getTarget()
    if (target) {
      this.setGameData('fatigue', 0)
      this.attack(target)
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
    let { health, fatigue, color } = STATS[type as keyof typeof STATS]
    this.playerType = type
    this.setTintFill(color)
    this.updateStats()
    this.setGameData('health', health)
    this.setGameData('fatigue', 0)
    this.setGameData('color', color)
    if (type === 'slime') {
      this.healthBar.setMax(health)
      this.fatigueBar.setMax(fatigue)
    }

    this.setAlpha(1)
  }

  updateStats = () => {
    let { health, armor, fatigue, damage } =
      STATS[this.playerType as keyof typeof STATS]
    const inventoryStats = (this.scene.inventoryService?.getInventoryStats(
      this.dataKey,
    ) ?? {}) as IPlayer

    this.setGameData('maxHealth', health + (inventoryStats.health ?? 0))
    this.setGameData('damage', damage + (inventoryStats.damage ?? 0))
    this.setGameData('armor', armor + (inventoryStats.armor ?? 0))
    this.setGameData('maxFatigue', fatigue + (inventoryStats.fatigue ?? 0))
  }

  attack(target: Player) {
    this.updateStats()
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

  getGameData = () => this.scene.data.get(`player-${this.dataKey}`) as IPlayer

  setGameData = (k: keyof IPlayer, v: number | string) =>
    this.scene.data.set(`player-${this.dataKey}`, {
      ...this.getGameData(),
      [k]: v,
    })

  damage(incomingDamage: number) {
    const health = this.getGameData().health
    const armor = this.getGameData().armor
    const mitigatedDamage = incomingDamage - armor
    const newHealth = health - mitigatedDamage
    this.setGameData('health', Math.max(0, newHealth))
    this.setTintFill(0xffffff)
    this.scene.time.delayedCall(ATTACK_SPEED / SPEED / 2, () => {
      this.setTintFill(this.getGameData().color)
      if (newHealth <= 0) this.die()
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
      //  TODO: Loot
      // if (Phaser.Math.RND.between(0, 1) === 0)
      //   this.scene.inventoryService?.dropLoot(this.x - 16, this.y - 32)
    }
  }
}
