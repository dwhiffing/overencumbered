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

    this.players.forEach((p, i) =>
      p.spawn(i === 0 ? 'knight' : i === 1 ? 'archer' : 'mage'),
    )

    this.uis = [
      new PlayerUI(this.scene, 0, 216, 'player-2'),
      new PlayerUI(this.scene, PLAYER_UI_WIDTH, 216, 'player-1'),
      new PlayerUI(this.scene, PLAYER_UI_WIDTH * 2, 216, 'player-0'),
    ]

    this.uis[2].select()

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

  nextDungeon = () => {
    this.roomIndex = 0
    // TODO: 
    this.levelKey = 'desert'

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
