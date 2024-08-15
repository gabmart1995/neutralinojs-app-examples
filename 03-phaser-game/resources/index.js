Neutralino.init();
Neutralino.events.on("windowClose", () => Neutralino.app.exit());

function preload() {
    // cargamos los entornos antes de iniciar el juego
    this.load.image('sky', 'static/images/sky.png');
    this.load.image('ground', 'static/images/platform.png');
    this.load.image('star', 'static/images/star.png');
    this.load.image('bomb', 'static/images/bomb.png');
    this.load.spritesheet('dude', 'static/images/dude.png', {
        frameWidth: 32, frameHeight: 48
    });
}

function create() {
    // cargamos la imagen del juego
    this.add.image(400, 300, 'sky');

    // creamos las plataformas
    plaforms = this.physics.add.staticGroup();
    
    // para editar un cuerpo estatico se establece a escala 2 y se refresca el sitio
    plaforms.create(400, 568, 'ground').setScale(2).refreshBody(); // suelo
    plaforms.create(600, 400, 'ground');
    plaforms.create(50, 250, 'ground');
    plaforms.create(750, 220, 'ground');

    // instanciamos al jugador usando sprites
    player = this.physics.add.sprite(100, 450, 'dude');

    // hace que el sprite tenga un pequeño rebote al saltar
    player.setBounce(0.2);

    // permite al jugador colicionar con los limites del juego
    player.setCollideWorldBounds(true);

    // fotogramas de movimiento
    this.anims.create({
        key: 'left',
        // selecciona 4 primeros fotogramas
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10, // 10 fotogramas x segundo
        repeat: -1, // indica que se debe repetir la animacion una vez terminada
    });

    this.anims.create({
        key: 'turn',
        // selecciona un fotograma especifico
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20, // 20 fotogramas x segundo
    });

    this.anims.create({
        key: 'right',
        // selecciona 4 primeros fotogramas
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10, // 10 fotogramas x segundo
        repeat: -1, // indica que se debe repetir la animacion una vez terminada
    });

    // añadimos fisicas de colision entre el jugador y plataformas
    // evitamos que el player traspase el suelo
    this.physics.add.collider(player, plaforms);

    // establecemos los cursores del teclado
    cursors = this.input.keyboard.createCursorKeys();

    // colocamos las estrellas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, plaforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // añadimos el marcador
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, plaforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    // teclas presionadas
    const isLeftDown = cursors.left.isDown;
    const isRightDown = cursors.right.isDown;
    const isJump = cursors.up.isDown && player.body.touching.down;

    if (isLeftDown) {
        player.setVelocityX(-160); // velocidad de desplazamiento
        player.anims.play('left', true);

    } else if (isRightDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        
    } else { // animacion para girar
        player.setVelocityX(0);
        player.anims.play('turn');

    }

    // salto
    if (isJump) player.setVelocityY(-330);
}

// ejecuta la funcion del colision elimina la estrella
// aumentando el puntaje
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('score: ' + score);

    if (stars.countActive(true) === 0) {
        // ira colocando estrella en otros lugares
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        // determinamos la posicion de la bomba
        // en el lado contrario al jugador
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
    
        // creamos las bombas
        const bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

// funcion que controla el impacto con las bombas
function hitBomb(player, bomb) {
    this.physics.pause();

    // pinta al jugador de rojo
    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

const config = {
    type: Phaser.AUTO,
    height: 600,
    width: 800,
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

// puntiaciones 
let score = 0;
let scoreText = '';
let gameOver = false;

// entorno
let plaforms;

// jugador
let player;

// cursores
let cursors;

// stars
let stars;
let bombs;

const game = new Phaser.Game(config);

