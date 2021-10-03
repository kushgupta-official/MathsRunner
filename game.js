var config={
    type:Phaser.AUTO,
    width:1600,
    height:600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: true
        }
    },
    scene:[Play]
}

window.focus();

var game=new Phaser.Game(config);