//when the page is loaded and everything is ready:
$(document).ready(function(){
    
    $(document).on('keydown', function(evt){
        console.log(evt.key);
        //Esc pressed during the gameplay: the "Menu" screen is opened
        if (evt.key === "Escape" || evt.key === "Esc"){
            if ($("#menu").css("display") === "none" && $("#settings-screen").css("display") === "none"){
                document.getElementById('menu').style.display = "block";
            }
        }
    });
    
    $("#resume").click(function(){
        //resume the current playthrough
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

    $("#restart-game").click(function(){
        //restart a new game from scratch
    });

    $("#endgame").click(function(){
        //exit from the game
    });
});