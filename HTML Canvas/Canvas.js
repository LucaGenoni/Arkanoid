//when the page is loaded and everything is ready:
$(document).ready(function(){
    
    $(document).on('keydown', function(evt){
        //Esc pressed during the gameplay: the "Menu" screen is opened
        if (evt.key === "Escape" || evt.key === "Esc"){
            if ($("#menu").css("display") === "none" && $("#settings-screen").css("display") === "none"){
                document.getElementById('menu').style.display = "block";
            }
        }
    });
    
    //Click on "Resume": close the "Menu" screen
    $("#resume").click(function(){
        document.getElementById('menu').style.display = "none";
        game.resume()
    });

    //Click on Settings while in "Menu" screen: show the "Settings" screen and hide the "Menu" one
    $("#settings").click(function(){
        document.getElementById('settings-screen').style.display = "block";
        document.getElementById('menu').style.display = "none";
    });

    //Click on Quit while in "Settings" screen: hide the "Settings" screen and show the "Menu" one
    $("#back-to-menu").click(function(){
        document.getElementById('menu').style.display = "block";
        document.getElementById('settings-screen').style.display = "none";
    });

    //Click on Quit while in "Menu" screen: exit from the menu
    $("#quit-menu").click(function(){
        document.getElementById('menu').style.display = "none";
    });
    
    $(".restart-game").click(function(){
        console.log("Restarting the game...");
        //if the player has won the game and wants to restart a new one, close the victory screen
        if ($("#victory-screen").css("display") !== "none" ){
            document.getElementById('victory-screen').style.display = "none";
        }

        //if the player has lost the game and wants to restart a new one, close the victory screen
        else if ($("#lost-screen").css("display") !== "none" ){
            document.getElementById('lost-screen').style.display = "none";
        }
        
        //in any case, restart the game creating a new one:
        
        //first, reset the UI
        $(".ui-score").text("Score: " + 0);
        document.getElementById('life-1').style.display = "inline-block";
        document.getElementById('life-2').style.display = "inline-block";
        document.getElementById('life-3').style.display = "inline-block";
        
        map2 = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,],
            [0,0,0,0,0,2,2,2,0,0,0,0,0,],
            [0,0,0,0,0,0,0,2,2,0,0,0,0,],
            [0,0,0,0,0,2,2,2,2,2,0,3,0,],
            [0,0,0,0,2,0,2,2,4,2,3,0,0,],
            [0,0,0,0,2,0,2,2,2,2,0,0,0,],
            [0,0,0,0,0,0,2,2,2,2,0,0,0,],
            [0,0,0,0,2,0,2,2,2,2,0,0,0,],
            [0,0,0,0,2,0,2,2,4,2,3,0,0,],
            [0,0,0,0,0,2,2,2,2,2,0,3,0,],
            [0,0,0,0,0,0,0,2,2,0,0,0,0,],
            [0,0,0,0,0,2,2,2,0,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,],
        ];
        map3 = []
        map2.forEach(e => {
            var column = []
            for (let i = 0; i < e.length; i++) {
                const num = e[i];
                column.push(num,num);
            }
            map3.push(column)
        });
        //then, the game
        game = new Arkanoid(map3);
        game.play();
    });
});