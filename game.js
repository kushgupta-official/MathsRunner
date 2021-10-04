window.onload=function(){
    var config={
        type:Phaser.AUTO,
        width:1334,
        height:750,
        physics: {
            default: 'arcade',
            // arcade: {
            //     gravity: {y: 300},
            //     // debug: false
            // }
        },
        scene:[Play]
    }
    game=new Phaser.Game(config);
    window.focus();
    resize();
    window.addEventListener("resize",resize,false);
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