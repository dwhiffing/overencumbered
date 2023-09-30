import Game from "../scenes/Game";
const PORTRAIT_SIZE = 64;
const BAR_WIDTH = 75.7;
const BAR_HEIGHT = 16;
const PLAYER_UI_WIDTH = PORTRAIT_SIZE + BAR_WIDTH;

export default class {
  scene: Game;
  players: Player[];
  enemies: Player[];
  activeIndex: number;
  constructor(scene: Game) {
    this.scene = scene;

    this.players = [new Player(this.scene, "player-0", 100, 150, 0xff5555)];
    this.enemies = [
      new Player(this.scene, "enemy-0", 300, 150, 0x5555ff, true),
    ];

    this.players.forEach((p) => this.scene.add.existing(p));
    this.enemies.forEach((p) => this.scene.add.existing(p));
    new PlayerUI(this.scene, 0, 216, "player-0");
    // new PlayerUI(this.scene, PLAYER_UI_WIDTH, 216, 0);
    // new PlayerUI(this.scene, PLAYER_UI_WIDTH * 2, 216, 0);
    this.activeIndex = 0;

    this.scene.time.addEvent({
      repeat: -1,
      callback: this.nextTurn,
      delay: 2000,
    });
  }
  nextTurn = () => {
    const fighters = [...this.players, ...this.enemies];
    // find next thing to attack, and make it attack
    const fighter = fighters.at(this.activeIndex);
    fighter?.attack?.(fighters.at(this.activeIndex - 1)!);
    this.activeIndex = (this.activeIndex + 1) % fighters.length;
  };
}

class PlayerUI {
  scene: Game;
  constructor(scene: Game, x: number, y: number, key: string) {
    this.scene = scene;

    this.scene.add
      .rectangle(x, y, PORTRAIT_SIZE, PORTRAIT_SIZE, 0x000000)
      .setOrigin(0);

    this.scene.add
      .rectangle(x, y, PORTRAIT_SIZE, PORTRAIT_SIZE, 0xff5555)
      .setOrigin(0);

    const bar = new Bar(
      this.scene,
      x + PORTRAIT_SIZE,
      y,
      BAR_WIDTH,
      BAR_HEIGHT,
      "red"
    );
    bar.setMax(this.scene.data.values[`player-${key}`].health);

    this.scene.data.events.on(
      `changedata-$player-${key}`,
      (a: any, _key: string, c: any) => {
        if (`` === _key) {
          bar.update(c.health);
        }
      }
    );
  }

  update() {}
}

class Bar {
  scene: Game | Phaser.Scene;
  max: number;
  value: number;
  sprite: Phaser.GameObjects.Rectangle;
  constructor(
    scene: Game,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    this.scene = scene;
    this.max = 0;
    this.value = 0;
    const COLORS = {
      red: [0xff0000, 0x000000],
    };

    this.scene.add
      //@ts-ignore
      .rectangle(x, y, width, height, COLORS[color][1])
      .setOrigin(0);
    this.sprite = this.scene.add
      //@ts-ignore
      .rectangle(x, y, width, height, COLORS[color][0])
      .setOrigin(0);
  }
  setMax = (m: number) => {
    this.max = m;
  };
  update = (v: number) => {
    this.value = v;
    this.sprite.setScale(v / this.max, 1);
  };
}

class Player extends Phaser.GameObjects.Sprite {
  dataKey: string;
  tintColor: number;
  bar?: Bar;
  scene: Game;
  constructor(
    scene: Game,
    dataKey: string,
    x: number,
    y: number,
    color: number,
    bar?: boolean
  ) {
    super(scene, x, y, "objects", 0);
    this.setTintFill(color);
    this.tintColor = color;
    this.dataKey = dataKey;
    this.scene = scene;
    this.scene.data.set(`player-${dataKey}`, {
      health: 10,
    });

    if (bar) {
      this.bar = new Bar(this.scene, this.x - 16, this.y - 32, 32, 4, "red");
      this.bar.setMax(10);
      this.scene.data.events.on(
        `changedata-player-${dataKey}`,
        (_: any, value: any) => {
          this.bar?.update(value.health);
        }
      );
    }
  }

  attack(target: Player) {
    this.scene.tweens.add({
      targets: this,
      x: this.x + (this.x > 200 ? -20 : 20),
      duration: 200,
      yoyo: true,
      onYoyo: () => {
        target.damage(1);
      },
    });
  }

  getGameData = () => this.scene.data.get(`player-${this.dataKey}`);

  setGameData = (k: string, v: any) =>
    this.scene.data.set(`player-${this.dataKey}`, {
      ...this.getGameData(),
      [k]: v,
    });

  damage(n: number) {
    const health = this.getGameData().health;
    this.setGameData("health", health - n);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.setTintFill(this.tintColor);
      if (health <= 0) this.die();
    });
  }

  die() {
    this.setAlpha(0);
  }
}
