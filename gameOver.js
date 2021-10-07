function gameOver(score,game){
    console.log("hi");
    $('#gameOverModal').modal('show');
    // document.getElementById("Total-Score").innerHTML=score; 
    gameScene=game;
}

function playAgain(){
    gameScene.scene.start("playGame");
}