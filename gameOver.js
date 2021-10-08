function manageGameOver(score,timmerValue,game){
    gameScene=game;
    document.getElementById("Total-Score").innerHTML=score;
    document.getElementById("survivalTime").innerHTML=timmerValue;
    $('#gameOverModal').modal('show');
    console.log("hiii");
}

function playAgain(){
    $('#gameOverModal').modal('hide');
    gameScene.scene.start("playGame");
    console.log("haii")
}