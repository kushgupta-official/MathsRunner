let gameScene;
let answer;
let marked=-1;
let options;
let timeVariable;
let countdownTimer;

//countdown start time
let countDuration=15;


function submitQuestion(){
    marked = $("input[name='inlineRadioOptions']:checked").val();
    $('input[name=inlineRadioOptions]').attr('checked',false);
    console.log(countDuration);
    if (countdownTimer==0){
        $('#questionModal').modal('hide');
        gameScene.scene.resume();
    }
    else if(marked > -1){
        clearInterval(timeVariable);
        if (options[marked]==answer){
            gameScene.updatePoints(gameOptions.correctAnswerPoints);
        }
        $('#questionModal').modal('hide');
        gameScene.scene.resume();
    }
    else{
        return;
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
    
        // Generate random number
        var j = Math.floor(Math.random() * (i + 1));
                    
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
        
    return array;
 }

function frameQuestion(){
    let question="";
    let operator,operand;
    for (let i=0;i<4;i++){
        if (Math.floor(Math.random()*2)){
            operator="+";
        }
        else{
            operator="-";
        }
        operand=String(Math.floor(Math.random() * 10));
        if (i==0){
            operator="";
        }
        else if (operand==0){
            operator="+";
        }
        question+=operator+operand;
    }
    document.getElementById("Question-Text").innerHTML="Solve : "+question;
    // console.log(question);   
    answer=eval(question);
    options=[answer];
    for (let i=0;i<3;i++){
        options.push(Math.floor(Math.random()*40))*i%2==0?1:-1;
    }
    options=shuffleArray(options);
    document.getElementById("Option-1").innerHTML=options[0];
    document.getElementById("Option-2").innerHTML=options[1];
    document.getElementById("Option-3").innerHTML=options[2];
    document.getElementById("Option-4").innerHTML=options[3];
    // console.log(options);
}

function manageQuestion(game){
    gameScene=game;
    countdownTimer=countDuration;
    document.getElementById("countdown").innerHTML="Time left : " + countdownTimer;
    frameQuestion();
    $('#questionModal').modal('show');
    timeVariable=setInterval(function(){
        document.getElementById("countdown").innerHTML="Time left : " + countdownTimer;
        if (countdownTimer==0){
            clearInterval(timeVariable);
            submitQuestion();
        }
        countdownTimer--;
    },1000);
}

function skipQuestion(){
    clearInterval(timeVariable);
    $('input[name=inlineRadioOptions]').attr('checked',false);
    $('#questionModal').modal('hide');
    gameScene.scene.resume();
}