import Game from '../scenes/Game'
import { Player } from '../sprites/Player'
import { PlayerUI } from '../sprites/PlayerUI'
import { LEVELS, PLAYER_UI_WIDTH } from '../utils'

export default class {
  scene: Game
  players: Player[]
  uis: PlayerUI[]
  enemies: Player[]
  roomIndex: number
  levelKey: string
  constructor(scene: Game) {
    this.scene = scene

    const X = 30
    const _X = 45
    this.players = [
      new Player(this.scene, 'player-0', X + _X * 2, 150),
      new Player(this.scene, 'player-1', X + _X, 150),
      new Player(this.scene, 'player-2', X, 150),
    ]
    this.players.forEach((p) => this.scene.add.existing(p))

    this.players[0]?.spawn('knight')

    this.uis = [
      new PlayerUI(this.scene, 0, 216, 'player-0'),
      new PlayerUI(this.scene, PLAYER_UI_WIDTH, 216, 'player-1'),
      new PlayerUI(this.scene, PLAYER_UI_WIDTH * 2, 216, 'player-2'),
    ]

    this.uis[0].show()
    this.uis[0].select()

    const B = 210
    const I = 45
    this.enemies = [
      new Player(this.scene, 'enemy-0', B, 150),
      new Player(this.scene, 'enemy-1', B + I, 150),
      new Player(this.scene, 'enemy-2', B + I * 2, 150),
      new Player(this.scene, 'enemy-3', B + I * 3, 150),
      new Player(this.scene, 'enemy-4', B + I * 4, 150),
    ]

    this.enemies.forEach((p) => this.scene.add.existing(p))

    this.roomIndex = 0
    this.levelKey = 'dungeon'

    this.nextRoom()

    this.scene.time.addEvent({
      repeat: -1,
      delay: 500,
      callback: () => this.checkEnemies(),
    })
  }

  unlockArcher = () => {
    this.scene.time.delayedCall(500, () => {
      this.players[1]?.spawn('archer')
      this.uis[1].show()
      this.uis[0].deselect()
      this.uis[1].deselect()
      this.uis[2].deselect()
      this.uis[0].setupListeners('player-1')
      this.uis[1].setupListeners('player-0')
    })
  }

  unlockMage = () => {
    this.scene.time.delayedCall(500, () => {
      this.players[2]?.spawn('mage')
      this.uis[2].show()
      this.uis[0].deselect()
      this.uis[1].deselect()
      this.uis[2].deselect()
      this.uis[0].setupListeners('player-2')
      this.uis[1].setupListeners('player-1')
      this.uis[2].setupListeners('player-0')
    })
  }

  nextDungeon = () => {
    this.roomIndex = 0

    // TODO:
    if (this.levelKey === 'dungeon') {
      this.unlockArcher()
      this.levelKey = 'desert'
    } else if (this.levelKey === 'desert') {
      this.unlockMage()
      this.levelKey = 'jungle'
    }

    this.nextRoom()
  }

  nextRoom = () => {
    const level = LEVELS[this.levelKey as keyof typeof LEVELS]
    const room = level.rooms[this.roomIndex++]
    if (!level || !room) return this.nextDungeon()
    this.spawnEnemies(room)
  }
  checkEnemies = () => {
    if (
      this.enemies.every((e) => {
        return e.getGameData()?.health <= 0
      })
    ) {
      this.nextRoom()
    }
  }

  spawnEnemies = (keys: string[]) => {
    this.enemies.slice(5 - keys.length).forEach((e, i) => e.spawn(keys[i]))
  }
}
