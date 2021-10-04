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
        //Group with all active platforms
        this.platformGroup=this.add.group({
            //removing a platform means adding it to pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        })
        //platform pool
        this.platformPool=this.add.group({
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform);
            }
        })

        this.addPlatform(game.config.width,game.config.width/2);
        // setting up player
        this.player=this.physics.add.sprite(100,450,"dude");
        this.player.setCollideWorldBounds(true);
        // this.ground.setCollideWorldBounds(true);
        this.physics.add.collider(this.player,this.platformGroup);

        //creating animation for the player
        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("dude",{start:0,end:3}),
            frameRate: 10,
            repeat: -1,
        });
        // this.groundCollider=this.physics.add.collider(this.player,this.ground,function(){
        //     if (!this.player.anims.isPlaying){
        //         this.player.anims.play("move");
        //     }
        // },null,this);
        this.player.play("move");
        this.myCam=this.cameras.main;
        this.myCam.setBounds(0,0,game.config.width*3,game.config.height);
        this.myCam.startFollow(this.player);
    }
    addPlatform(platformWidth,posX){
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
        }
        else{
            platform = this.physics.add.sprite(posX, game.config.height * 0.8, "platform");
            platform.setImmovable(true);
            platform.setVelocityX(gameOptions.platformStartSpeed * -1);
            this.platformGroup.add(platform);
        }
        platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }
    update(){
        this.player.x+=3;
        this.player.scaleX=-1;

        this.bg_1.tilePositionX = this.myCam.scrollX * .3;
        this.bg_2.tilePositionX = this.myCam.scrollX * .6;
        // this.ground.tilePositionX = this.myCam.scrollX;
    }
}