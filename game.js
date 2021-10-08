let clock;
let timer;
let gameOptions={

    mountainSpeed: 80,  
    
    platformStartSpeed: 300,

    // spawn range, how far should be the rightmost platform from the right edge before next platform spawns
    // spawnRange: [100, 350],
    spawnRange: [80, 300],

    // platform width range
    platformSizeRange: [130, 300],

    //grdavity at which player falls
    playerGravity: 900,

    jumpForce: 400,

    playerStartPosition: 200,

    // max jumps player can take
    jumps: 2,

    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],
 
    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,
 
    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],

    //probability of coin occuring on platform
    coinPercent: 75,//75

    //probability of question occuring on platform
    quesPercent: 25,//25

    //coins value
    coinValue: 10,

    correctAnswerPoints: 30,

    wrongAnswerPoints: -10,
    
    score: 0,
}

window.onload=function(){
    var config={
        type:Phaser.AUTO,
        width:1334,
        height:750,
        backgroundColor: 0x0c88c7,
        physics: {
            default: 'arcade',
            // arcade: {
            //     gravity: {y: 300},
                debug: false
            // }
        },
        scene:[PreloadGame, Play]
    }
    game=new Phaser.Game(config);
    window.focus();
    resize();
    window.addEventListener("resize",resize,false);
}

class PreloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.plugin('rexclockplugin',
                         'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', 
                         true
                        );
        this.load.image('sky','assets/sky.png');
        this.load.image('ground','assets/ground.png');
        this.load.image('bg_1','assets/bg_1.png');
        this.load.image('bg_2','assets/bg_2.png');
        this.load.image('platform','assets/platform.png');
        this.load.image('ques','assets/ques.png');

        this.load.spritesheet("coin", "assets/coin.png", {
            frameWidth: 20,
            frameHeight: 20
        });
        // moving player 
        this.load.spritesheet('dude','assets/dude.png', {
             frameWidth: 32, 
             frameHeight: 48 
        });
        // mountains at the background
        this.load.spritesheet("mountain", "assets/mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });
    }

    create(){
        //creating animation for the player
        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("dude",{
                start:5,
                end:8
            }),
            frameRate: 10,
            repeat: -1,
        });
        //creating animation for the stars
        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin",{
                start: 0, 
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });
        this.scene.start("playGame");
    }
}

class Play extends Phaser.Scene{
    constructor(){
        super("playGame");
    }

    create(){
        this.addedPlatforms=0;
        //mountains (at background) group
        this.mountainGroup=this.add.group();
        this.addMountains();

        //score text at top left corner
        this.scoreText=this.add.text(16,16,"Score : 0",{
            fontSize: "32px",
            fill: "#F7F9F9"
        });

        //Setting Timer in Game
        this.timerText = this.add.text(1100, 16, 'Time: 00:00', { fontSize: '32px', fill: '#F7F9F9' });
        clock = this.plugins.get('rexclockplugin').add(this, game);
        clock.start();
        timer = this.time.addEvent({
            delay: 1000,                // ms
            callback: () => {
                this.timmerValue = this.millisToMinutesAndSeconds(clock.now);
                this.timerText.setText('Time: ' + this.timmerValue);
                console.log();
            },
            loop: true
        });
        this.coinsValue = gameOptions.score;
        this.timmerValue = this.millisToMinutesAndSeconds(clock.now);

        // Setting ground
        //Group with all active platforms
        this.platformGroup=this.add.group({
            //removing a platform means adding it to platform pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform);
            }
        });
        //platform pool-where platforms are not active
        this.platformPool=this.add.group({
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform);
            }
        });

        //Setting Coins
        this.coinGroup=this.add.group({
            removeCallback: function(coin){
                coin.scene.coinPool.add(coin);
            }
        });
        this.coinPool=this.add.group({
            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin);
            }
        });

        //Setting Questions(Mathematical)
        this.quesGroup=this.add.group({
            removeCallback: function(ques){
                ques.scene.quesPool.add(ques);
            }
        });
        this.quesPool=this.add.group({
            removeCallback: function(ques){
                ques.scene.quesGroup.add(ques);
            }
        });

        this.playerJumps=0;
        this.addPlatform(game.config.width,game.config.width/2,game.config.height*gameOptions.platformVerticalLimit[1]);
        // setting up player
        this.player=this.physics.add.sprite(gameOptions.playerStartPosition,game.config.height*0.7,"dude");
        this.player.anims.play("move");
        // this.player.setCollideWorldBounds(true);
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);

        this.physics.add.collider(this.player, this.platformGroup, function(){
 
            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying){
                this.player.anims.play("move");
            }
        }, null, this);

        // overlap between player and coins
        this.physics.add.overlap(this.player,this.coinGroup,function(player,coin){
            this.tweens.add({
                targets: coin,
                y: coin.y-100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(){
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                }
            });
            coin.disableBody(true, true);
            this.updatePoints(gameOptions.coinValue);
        },null,this);

        //overlap between player and questions
        this.physics.add.overlap(this.player,this.quesGroup,function(player,ques){
            this.tweens.add({
                targets: ques,
                y: ques.y-100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(){
                    this.quesGroup.killAndHide(ques);
                    this.quesGroup.remove(ques);
                }
            });
            ques.disableBody(true, true);
            this.dispQuestion();
        },null,this);
        // this.groundCollider=this.physics.add.collider(this.player,this.ground,function(){
        //     if (!this.player.anims.isPlaying){
        //         this.player.anims.play("move");
        //     }
        // },null,this);
        // this.player.play("move");
        // this.myCam=this.cameras.main;
        // this.myCam.setBounds(0,0,game.config.width*3,game.config.height);
        // this.myCam.startFollow(this.player);
        this.input.on("pointerdown", this.jump, this);
        // var spacebarKey=game.input.keyboard.addkey(Pas);
        // spacebarKey.on("down",this.jump);
    }

    //adding mountains
    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }

    // getting rightmost mountain x position
    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }
    updatePoints(val){
        gameOptions.score+=val;
        this.scoreText.setText('Score : ' + gameOptions.score);
        console.log("changed");
        // if (gameOptions.score<0){
        //     // setTimeout(function(){
        //     //     this.scene.pause();
        //     // },2000);
        //     this.scene.pause();
        //     manageGameOver(gameOptions.score,this.timmerValue,this);
        //     gameOptions.score=0;
        // }
    }
    dispQuestion(){
        this.scene.pause();
        manageQuestion(this,this.timmerValue);
        // this.scene.resume();
    }
    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms++;
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio =  platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        }
        else{
            // platform = this.physics.add.sprite(posX, game.config.height * 0.8, "platform");
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(gameOptions.platformStartSpeed * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
        // platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        // is there a coin over the platform?
        if(this.addedPlatforms > 1){
            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }
            if(Phaser.Math.Between(1, 100) <= gameOptions.quesPercent){
                if(this.quesPool.getLength()){
                    let ques = this.quesPool.getFirst();
                    ques.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
                    ques.y = posY - 46;
                    ques.alpha = 1;
                    ques.active = true;
                    ques.visible = true;
                    this.quesPool.remove(ques);
                }
                else{
                    let ques = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, "ques");
                    // ques.setSize(8,2,true);
                    ques.scale=0.07;
                    ques.setImmovable(true);
                    ques.setVelocityX(platform.body.velocity.x);
                    ques.setDepth(2);
                    this.quesGroup.add(ques);
                }
            }
        }
    }
    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    jump(){
        if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
 
            // stops animation
            this.player.anims.stop();
        }
    }
    update(){
        // this.player.x+=3;
        // this.player.scaleX=-1;

        // this.bg_1.tilePositionX = this.myCam.scrollX * .3;
        // this.bg_2.tilePositionX = this.myCam.scrollX * .6;
        // this.ground.tilePositionX = this.myCam.scrollX;

        if(this.player.y > game.config.height){
            this.scene.pause();
            manageGameOver(gameOptions.score,this.timmerValue,this);
            gameOptions.score=0;
            // this.scene.start("playGame");
        }
        this.player.x = gameOptions.playerStartPosition;
        
        // recycling mountains
        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);

        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight=0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < -platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // recycling coins
        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        //recycling platforms
        this.quesGroup.getChildren().forEach(function(ques){
            if(ques.x < - ques.displayWidth / 2){
                this.quesGroup.killAndHide(ques);
                this.quesGroup.remove(ques);
            }
        }, this);

        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }

    //for timmer
    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
    }
}

function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}