const ROUND_DURATION = 5000;
var round = 1;
var BB_N = 1;
var Bb_N = 4;
var bb_N = 5; // start in Hardy-Weinberg equilibrium: p = 0.3
var info;
var timer;
var melanics_n = 0;
var nonmelanics_n = 0;
var total_n = 0;

var SceneGamePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function SceneGamePlay ()
        {
            Phaser.Scene.call(this, { key: 'sceneGamePlay' });
        },
    preload: preloadGamePlay,
    create: createGamePlay,
    update: updateGamePlay
});

var SceneIntro = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function SceneIntro ()
        {
            Phaser.Scene.call(this, { key: 'sceneIntro' });
        },
    create: function () {
		const nextButton = this.add.text(600, 600, 'Next', { fill: '#87ceeb' });
		nextButton.setInteractive();

		nextButton.on('pointerup', () => this.scene.start('sceneGamePlay'));
    }
});

var SceneGameOver = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function SceneGameOver ()
        {
            Phaser.Scene.call(this, { key: 'sceneGameOver' });
        },
	preload: function () {
        this.load.image('nonmelanic_large', 'assets/nonmelanic_large.png');
    },
    create: function () {
		this.add.image(400, 200, 'nonmelanic_large');
		const congrats = this.add.text(400, 450, 'Nice job!', { fontSize: '30px', fill: '#87ceeb' })
		congrats.setOrigin(0.5);
		const info = this.add.text(400, 550,
	        'melanics: ' + melanics_n +
	        '    non-melanics: ' + nonmelanics_n +
	        '    total: ' + total_n,
			{ fill: '#87ceeb' }
		);
		info.setOrigin(0.5);
		const thanks = this.add.text(400, 580, 'Thank you for playing! Ctrl/Cmd+R to play again.', { fill: '#87ceeb' });
		thanks.setOrigin(0.5);
	}
});

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [ SceneIntro, SceneGamePlay, SceneGameOver ]
};

var game = new Phaser.Game(config);

function preloadGamePlay ()
{
  this.load.image('melanic', 'assets/melanic.png');
  this.load.image('nonmelanic', 'assets/nonmelanic.png');
  this.load.image('lichenless', 'assets/lichenless.png');
  this.load.image('lichen', 'assets/lichen.png');
}

function createGamePlay ()
{
	if (round == 1 || round == 4 || round == 5 && Math.random() <= 0.5) {
		this.add.image(400, 400, 'lichen');
	} else {
		this.add.image(400, 400, 'lichenless');
	}

    melanics = this.physics.add.staticGroup();
    nonmelanics = this.physics.add.staticGroup();

    for (var i = 0; i < BB_N + Bb_N; i++) {
        melanic = melanics.create(
            Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800),
            'melanic');
        melanic.setInteractive()
        melanic.on('clicked', collectMelanic, this);
    }

    for (var i = 0; i < bb_N; i++) {
        nonmelanic = nonmelanics.create(
            Phaser.Math.RND.between(0, 800), Phaser.Math.RND.between(0, 800),
            'nonmelanic');
        nonmelanic.setInteractive()
        nonmelanic.on('clicked', collectNonMelanic, this);
    }

    this.input.on('gameobjectup', function (pointer, gameObject)
    {
        gameObject.emit('clicked', gameObject);
    }, this);

    info = this.add.text(10, 10, '', { fill: '#87ceeb' });
    timer = this.time.addEvent({ delay: ROUND_DURATION, callback: roundOver, callbackScope: this });
}

function updateGamePlay ()
{
    info.setText(
        'melanics: ' + melanics_n +
        '    non-melanics: ' + nonmelanics_n +
        '\ntime remaining: ' + Math.floor(ROUND_DURATION - timer.getElapsed()) +
        '    total: ' + total_n
	);
}

function collectMelanic (melanic)
{
    melanic.off('clicked', collectMelanic);
    melanic.input.enabled = false;
    melanic.setVisible(false);
    melanics_n ++;
    total_n ++;
	if (Math.random() <= BB_N / (BB_N + Bb_N)) {
		BB_N --;
	} else {
		Bb_N --;
	}
}

// TODO: Refactor this
function collectNonMelanic (nonmelanic)
{
    nonmelanic.off('clicked', collectNonMelanic);
    nonmelanic.input.enabled = false;
    nonmelanic.setVisible(false);
    nonmelanics_n ++;
    total_n ++;
	bb_N --;
}

function roundOver ()
{
    this.input.off('gameobjectup');
	round ++;
    multiply();
	if (round <= 5) {
		this.scene.restart();
	} else {
		this.scene.start('sceneGameOver');
	}

}

function multiply ()
{
	var p_BB_N = BB_N;
	var p_Bb_N = Bb_N;
	var p_bb_N = bb_N;
	var p_total_N = p_BB_N + p_Bb_N + p_bb_N;
	while (p_total_N >= 2) {
		var p1;
		if (Math.random() <= p_BB_N / p_total_N) {
			p1 = 'BB';
			p_BB_N --;
		} else if (Math.random() <= p_Bb_N / (p_Bb_N + p_bb_N)) {
			p1 = 'Bb';
			p_Bb_N --;
		} else {
			p1 = 'bb';
			p_bb_N --;
		}
		p_total_N -= 1;
		var p2;
		if (Math.random() <= p_BB_N / p_total_N) {
			p2 = 'BB';
			p_BB_N --;
		} else if (Math.random() <= p_Bb_N / (p_Bb_N + p_bb_N)) {
			p2 = 'Bb';
			p_Bb_N --;
		} else {
			p2 = 'bb';
			p_bb_N --;
		}
		p_total_N -= 1;

		if (p1 == 'BB' && p2 == 'BB') {
			BB_N ++;
		} else if (p1 == 'bb' && p2 == 'bb') {
			bb_N ++;
		} else if (p1 == 'BB' && p2 == 'bb' || p1 == 'bb' && p2 == 'BB') {
			if (Math.random() <= 0.5) {
				Bb_N ++;
			} else if (Math.random() <= 0.5) {
				BB_N ++;
			} else {
				bb_N ++;
			}
		} else if (p1 == 'BB' && p2 == 'Bb' || p1 == 'Bb' && p2 == 'BB') {
			if (Math.random() <= 0.5) {
				BB_N ++;
			} else {
				Bb_N ++;
			}
		} else {
			if (Math.random() <= 0.5) {
				Bb_N ++;
			} else {
				bb_N ++;
			}
		}
	}
}
