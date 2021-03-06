let gameScene;
let answer;
let marked=-1;
let options;
let timeVariable;
let countdownTimer;
let timmer;
let countDuration=15;


function submitQuestion(){
    marked = $("input[name='inlineRadioOptions']:checked").val();
    $('input[name=inlineRadioOptions]').attr('checked',false);

    //If time is finished
    if (countdownTimer==0){
        marked=-1;
        gameScene.updatePoints(gameOptions.wrongAnswerPoints);
        $('#questionModal').modal('hide');
        showAlert(0);
    }

    //Answer marked and submitted before end of time
    else if(marked > -1){
        clearInterval(timeVariable);
        //if answer marked is correct
        if (options[marked]==answer){
            gameScene.updatePoints(gameOptions.correctAnswerPoints);
            showAlert(1);
        }
        //if answer marked is wrong
        else{
            gameScene.updatePoints(gameOptions.wrongAnswerPoints);
            showAlert(0);
        }
        $('#questionModal').modal('hide');
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
    //randomly generating question
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
    answer=eval(question);
    options=[answer];
    //For randomly generating options
    // for (let i=0;i<3;i++){
    //     options.push(Math.floor(Math.random()*40))*i%2==0?1:-1;
    // }

    //Near to answer values options
    options.push(answer+1);
    options.push(answer-1);
    options.push(answer+2);

    //shuffling options
    options=shuffleArray(options);

    //assigning options
    document.getElementById("Option-1").innerHTML=options[0];
    document.getElementById("Option-2").innerHTML=options[1];
    document.getElementById("Option-3").innerHTML=options[2];
    document.getElementById("Option-4").innerHTML=options[3];
}

function manageQuestion(game,time){
    gameScene=game;
    timmer=time;

    //Time Left for solving question
    countdownTimer=countDuration;
    document.getElementById("countdown").innerHTML="Time left : " + countdownTimer;

    //Framing Question
    frameQuestion();
    $('#questionModal').modal('show');
    countdownTimer--;

    //Countdown Timer
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
    marked=-1;
    gameScene.updatePoints(gameOptions.wrongAnswerPoints);
    showAlert(0);
}

//Alert popup after Question Modal
function showAlert(correct) {
    let className;
    let message;

    if(correct) {
        className = "alert alert-success collapse";
        message = "Correct Answer, you earned "+gameOptions.correctAnswerPoints+" points.";
    } else if(marked<0) {
        className = "alert alert-warning collapse";
        message = "Missed it, you lost 10 Points, the correct answer is "+answer;
    } else{
        className = "alert alert-danger collapse";
        message = "Wrong Answer, you lost 10 Points, the correct answer is "+answer;
    }

    $("#alert").attr("class",className);
    $("#alert").text(message);
    $('#alert').show('fade');

    setTimeout(function(){
        $('#alert').hide('fade');
    },2000);
    setTimeout(function(){
        gameScene.scene.resume();
    },2000);
}