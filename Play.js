class Play extends Phaser.Scene{
    constructor(){
        super("playGame");
    }
    preload(){
        this.load.image('sky','assets/sky.png');
        this.load.image('ground','assets/ground.png');
        this.load.image('bg_1','assets/bg_1.png');
        this.load.image('bg_2','assets/bg_2.png');
        this.load.image('platform','assets/platform.png');
        this.load.spritesheet('dude','assets/dude.png', {
             frameWidth: 32, 
             frameHeight: 48 
        });
    }
    
    create(){
        // this.add.image(800,300,'sky');
        // this.add.tileSprite(800,300,1600,600,'sky');
        // this.add.tileSprite(800,580,1600,32,'ground');
        // let player=this.physics.add.sprite(100,450,'dude');
        // player.setCollideWorldBounds(true);
        // player.setBounce(0.2);
        // this.physics.add.collider(player,ground);

        // Setting the Background
        this.bg_1=this.add.tileSprite(0,0,game.config.width,game.config.height,"sky");
        // Set its pivot to the top left corner
        this.bg_1.setOrigin(0,0);
        // fixing it so it won't move when the camera moves.
        // Instead moving its texture on the update
        this.bg_1.setScrollFactor(0);


        // Setting second Background same as first
        this.bg_2=this.add.tileSprite(0,0,game.config.width,game.config.height,"bg_2");
        this.bg_2.setOrigin(0,0);
        this.bg_2.setScrollFactor(0);

        // Setting ground
        this.ground=this.add.tileSprite(0,0,game.config.width,48,"ground");
        this.ground.setOrigin(0,0);
        this.ground.setScrollFactor(0);
        // setting this ground at bottom of the screen
        this.ground.y=550;
        //setting physics for ground
        // this.physics.add.existing(this.ground);
        
        // setting up player
        this.player=this.physics.add.sprite(100,450,"dude");
        this.player.setCollideWorldBounds(true);
        // this.ground.setCollideWorldBounds(true);
        this.physics.add.collider(this.player,this.ground);

        //creating animation for the player
        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("dude",{start:0,end:3}),
            frameRate: 10,
            repeat: -1,
        });
        this.player.play("move");
        this.myCam=this.cameras.main;
        this.myCam.setBounds(0,0,game.config.width*3,game.config.height);
        this.myCam.startFollow(this.player);
    }
    
    update(){
        this.player.x+=3;
        this.player.scaleX=-1;

        this.bg_1.tilePositionX = this.myCam.scrollX * .3;
        this.bg_2.tilePositionX = this.myCam.scrollX * .6;
        this.ground.tilePositionX = this.myCam.scrollX;
    }
}