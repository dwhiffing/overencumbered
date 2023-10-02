import Game from '../scenes/Game'
import { SPEED, STATS, ATTACK_SPEED, IPlayer, IItem, XP_LEVELS } from '../utils'
import { Bar } from './Bar'

export class Player extends Phaser.GameObjects.Sprite {
  dataKey: string
  playerType?: string
  isDying?: boolean
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
    this.setGameData('experience', 0)
    this.setGameData('level', 1)
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
    this.isDying = true
    this.setAlpha(0)

    this.scene.time.addEvent({
      repeat: -1,
      delay: 100 / SPEED,
      callback: () => this.tick(),
    })
  }

  tick() {
    if (this.isDying) return
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
    this.scene.inventoryService?.renderInventory()
    this.setGameData('health', this.getGameData().maxHealth)
  }

  takeAction = () => {
    this.setGameData('fatigue', this.getGameData().maxFatigue)

    const healthThreshold = this.getGameData().maxHealth / 2
    const potion = this.getItem('health_potion')
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
    ).filter((f) => !f.isDying)

    return targets[0]!
  }

  spawn(type: string) {
    let { health, fatigue, texture, flipX, color, level, experience } =
      STATS[type as keyof typeof STATS]
    this.setTexture(texture)
    this.playerType = type
    this.isDying = false
    this.play(`${type}-revive`)
    this.once('animationcomplete', () => {
      this.play(`${type}-idle`)
    })
    this.updateStats()
    this.setFlipX(flipX)
    this.setScale(2)
    this.setGameData('health', health)
    this.setGameData('level', level)
    this.setGameData('experience', experience)
    this.setGameData('fatigue', 0)
    this.setGameData('color', color)
    this.healthBar.setMax(health)
    this.fatigueBar.setMax(fatigue)

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
    if (this.isDying) return
    this.updateStats()
    this.play(`${this.playerType}-attack`)
    this.scene.tweens.add({
      targets: this,
      x: this.x + (this.x > 200 ? -20 : 20),
      duration: ATTACK_SPEED / SPEED,
      yoyo: true,
      onComplete: () => {
        if (!this.isDying) this.play(`${this.playerType}-idle`)
      },
      onYoyo: () => {
        target.damage(this.getGameData()?.damage ?? 1, this)
      },
    })
  }

  getGameData = () => this.scene.data.get(`player-${this.dataKey}`) as IPlayer

  setGameData = (k: keyof IPlayer, v: number | string) =>
    this.scene.data.set(`player-${this.dataKey}`, {
      ...this.getGameData(),
      [k]: v,
    })

  damage(incomingDamage: number, damager: Player) {
    const health = this.getGameData().health
    const armor = this.getGameData().armor
    const mitigatedDamage = incomingDamage - armor
    const newHealth = health - mitigatedDamage
    this.setGameData('health', Math.max(0, newHealth))

    if (this.anims.currentAnim.key.includes('idle'))
      this.play(`${this.playerType}-hit`)
    this.scene.time.delayedCall(ATTACK_SPEED / SPEED, () => {
      if (!this.isDying) this.play(`${this.playerType}-idle`)
    })
    this.scene.time.delayedCall(ATTACK_SPEED / SPEED / 2, () => {
      if (newHealth <= 0) this.die(damager)
    })
  }

  levelUp() {
    this.setGameData('level', this.getGameData().level + 1)
    const s = this.scene.inventoryService
    if (!s) return
    const inv = s.getInventory(this.dataKey)
    this.scene.data.set(`inventory-${this.dataKey}`, {
      ...inv,
      availableCellCount: inv.availableCellCount + 1,
    })
    this.scene.inventoryService?.renderInventory()
  }
  getExperience(amount: number) {
    this.setGameData('experience', this.getGameData().experience + amount)
    if (this.getGameData().experience >= XP_LEVELS[this.getGameData().level]) {
      this.levelUp()
    }
  }

  die(damager: Player) {
    if (this.isDying) return
    this.isDying = true
    this.setGameData('health', 0)
    this.healthBar?.hide()
    this.fatigueBar?.hide()
    this.play(`${this.playerType}-dead`)

    const counters = this.scene.data.values['loot-counters']
    const killCount = counters?.[this.playerType!] ?? 0
    this.scene.data.values['loot-counters'] = {
      ...counters,
      [this.playerType!]: killCount + 1,
    }

    damager.getExperience(this.getGameData().level)
    const isEnemy = !!this.dataKey.match(/enemy/)
    if (isEnemy) {
      this.scene.data.values['loot-counters'] = {
        ...counters,
        [this.playerType!]: killCount + 1,
      }
      this.scene.inventoryService?.dropLoot(
        this.x - 16,
        this.y - 60,
        this.playerType!,
      )
    }
  }
}
