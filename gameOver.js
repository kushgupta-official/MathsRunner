function manageGameOver(score,game){
    gameScene=game;
    document.getElementById("Total-Score").innerHTML=score; 
    $('#gameOverModal').modal('show');
    console.log("hiii");
}

function playAgain(){
    $('#gameOverModal').modal('hide');
    gameScene.scene.start("playGame");
    console.log("haii")
}