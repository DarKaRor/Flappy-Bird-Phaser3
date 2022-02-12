
const config = {
    width: 600,
    height: 600,
    parent: 'container',
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 500
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

function preload() {
    this.load.image("bird", "assets/flappy_bird.png");
    this.load.image("pipe", "assets/pipe.png");
}

function create() {
    // Resize the bird to fit the screen
    this.bird = this.add.image(config.width / 2, config.height / 2, "bird");
    this.bird.setScale(.1);

    // Create a physics body for the bird
    this.physics.world.enable(this.bird);
    this.bird.body.setCollideWorldBounds(true);
    this.bird.body.setVelocity(0, 100);

    this.pipesSpace = 250;
    // The pipes will be r1 instances
    this.pipes = this.physics.add.group({
        key: 'pipe',
        repeat: 3,
        setXY: {
            x: config.width + 100,
            y: Phaser.Math.Between(0, config.height),
            stepX: this.pipesSpace
        },
        immovable: true,
        allowGravity: false
    });

    // Create 1 new pipe 
    this.space = 150;
    this.pipes.children.iterate(function (child) {
        child.setScale(.3);
        child.y = getRandomHeight(child);

        // Create upper pipe
        var upperPipe = this.add.image(child.x, child.y, "pipe");
        upperPipe.setScale(.3);
        upperPipe.y = upperPipe.y - upperPipe.height * .3 - this.space;
        upperPipe.setAngle(180);

        this.physics.world.enable(upperPipe);

        this.pipes.add(upperPipe);

    }, this);

    this.pipes.children.iterate(function (child) {
        child.body.setAllowGravity(false);
        child.body.setImmovable(true);
    });


    let pipeCollider = this.physics.add.collider(this.bird, this.pipes, function (bird, pipe) {
        pipeSpeed = 0;
        gameOver = true;
        this.bird.setTint(0xff0000);
        this.bird.body.velocity.y = 100;
        // Deactivate collision between the bird and the pipes
        this.physics.world.removeCollider(pipeCollider);
    }, null, this);

}

function getRandomHeight(child) {
    return Phaser.Math.Between(config.height - (child.height * .3) / 2, config.height + (child.height * .3) / 2 - 100);
}



let pipeSpeed = 2;
let gameOver = false;
function update(time, delta) {

    // Move the pipes

    this.pipes.children.iterate(function (child) {
        child.x -= pipeSpeed;
    });

    // Check if the pipes are off the screen
    let toRemove = [];
    this.pipes.children.iterate(function (child) {
        if (child.x < 0 - child.width * .3) toRemove.push(child);
    });

    toRemove.forEach(function (child) {
        child.setVisible(false);
        this.pipes.remove(child);
        this.physics.world.disable(child);

        if (child.angle != -180) {
            let lastPipe = this.pipes.getChildren()[this.pipes.getChildren().length - 1];

            // Create a new pipe

            let newPipe = this.add.image(lastPipe.x + lastPipe.width * .3 + this.pipesSpace, 0, "pipe");
            newPipe.setScale(.3);
            newPipe.y = getRandomHeight(newPipe);
            this.physics.world.enable(newPipe);

            let upperPipe = this.add.image(newPipe.x, newPipe.y, "pipe");
            upperPipe.setScale(.3);
            upperPipe.y = upperPipe.y - upperPipe.height * .3 - this.space;
            upperPipe.setAngle(180);

            this.physics.world.enable(upperPipe);

            this.pipes.add(newPipe);
            this.pipes.add(upperPipe);
        }
    }, this);

    // Bird movement

    if (this.bird.body.velocity.y > 100) {
        this.bird.angle += 5;
        if (this.bird.angle > 90) this.bird.angle = 90;
    }
    else if (this.bird.body.velocity.y < 0) {
        this.bird.angle -= 10;
        if (this.bird.angle < -45) this.bird.angle = -45;
    }


    // Input

    this.input.on('pointerdown', function (pointer) {
        if (gameOver) return;
        this.bird.body.setVelocity(0, -200);
    }, this);





}