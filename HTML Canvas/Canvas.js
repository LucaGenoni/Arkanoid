//when the page is loaded and everything is ready:
$(document).ready(function(){
    
    $(document).on('keydown', function(evt){
        //Esc pressed during the gameplay: the "Menu" screen is opened
        if (evt.key === "Escape" || evt.key === "Esc"){
            if ($("#menu").css("display") === "none"){
                document.getElementById('menu').style.display = "block";
            }
        }
        //"1" pressed during the gameplay: the camera parameters can be modified
        else if (evt.key === "1"){
            document.getElementById('camera').style.display = "inline-block";
            document.getElementById('lights').style.display = "none";
        }
        //"2" pressed during the gameplay: the lights parameters can be modified
        else if (evt.key === "2"){
            document.getElementById('lights').style.display = "inline-block";
            document.getElementById('camera').style.display = "none";
        }
        //"0" pressed during the gameplay: if camera and/or lights changes were enabled, they are disabled
        else if (evt.key === "0" && ($("#lights").css("display") !== "none" || $("#camera").css("display") !== "none")){
            document.getElementById('camera').style.display = "none";
            document.getElementById('lights').style.display = "none";
        }
    });

    //handling the Camera Toolbox appearance / disappearance
    $("#camera-button").click(function(){
        if ($("#camera-toolbox").css("display") === "none"){
            document.getElementById('camera-toolbox').style.display = "flex";
        }
        else {
            document.getElementById('camera-toolbox').style.display = "none";
        }
    });

    //handling the Lights Toolbox appearance / disappearance
    $("#lights-button").click(function(){
        if ($("#lights-toolbox").css("display") === "none"){
            document.getElementById('lights-toolbox').style.display = "flex";
        }
        else {
            document.getElementById('lights-toolbox').style.display = "none";
        }
    });
    
    //The "gear" icon has been pressed during the gameplay: the "Menu" screen is opened
    $("#menu-gear").click(function(){
        document.getElementById('menu').style.display = "block";
        game.pause();
    });
    
    //Click on "Resume": close the "Menu" screen
    $("#resume").click(function(){
        document.getElementById('menu').style.display = "none";
        game.resume();
    });

    //Click on Quit while in "Menu" screen: exit from the menu
    $("#quit-menu").click(function(){
        document.getElementById('menu').style.display = "none";
        game.resume();
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
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,3,0,],
            [0,0,0,0,0,0,0,0,2,0,2,2,4,2,3,0,0,],
            [0,0,0,0,0,0,0,0,2,0,2,2,2,2,0,0,0,],
            [0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,],
            [0,0,0,0,0,0,0,0,2,0,2,2,2,2,0,0,0,],
            [0,0,0,0,0,0,0,0,2,0,2,2,4,2,3,0,0,],
            [0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,3,0,],
            [0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
        ];
        map3 = [];
        map2.forEach(e => {
            var column = [];
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

    //substitute the default values of camera/lights menus with the actual values used
    
    /*<-------- Camera -------->*/
    $("#camera-x-value").html(space._pos_cam[0]);
    $("#camera-y-value").html(space._pos_cam[1]);
    $("#camera-z-value").html(space._pos_cam[2]);
    $("#fovy-value").html(space._fovy);
    $("#elev-value").html(space._elev);
    $("#angle-value").html(space._ang);
    $("#w-value").html(space._w);
    $("#h-value").html(space._h);
    $("#n-value").html(space._n);
    $("#f-value").html(space._f);
    
    /*<-------- Lights -------->*/
    $("#l_pos-x-value").html(setup.globalsLight.l_pos[0]);
    $("#l_pos-y-value").html(setup.globalsLight.l_pos[1]);
    $("#l_pos-z-value").html(setup.globalsLight.l_pos[2]);
    $("#l_dir-x-value").html(setup.globalsLight.l_dir[0]);
    $("#l_dir-y-value").html(setup.globalsLight.l_dir[1]);
    $("#l_dir-z-value").html(setup.globalsLight.l_dir[2]);
    $("#l_ball_pos-x-value").html(setup.globalsLight.l_ball_pos[0]);
    $("#l_ball_pos-y-value").html(setup.globalsLight.l_ball_pos[1]);
    $("#l_ball_pos-z-value").html(setup.globalsLight.l_ball_pos[2]);
    
    //handling the pressure of each button in the camera/lights menus (when the pressure of one < or > button happens,
    //we check which parameter the button influences, and then depending from whether the button was < or > we change
    //the value accordingly both in the js file and in the camera/lights menu.
    $(".btn-sm").click(function(){

        /*<-------- Camera -------->*/
        if ($(this).siblings("p").text() === "Camera X :"){
            if ($(this).text() === " < "){
                space._pos_cam[0] = space._pos_cam[0] - 1;
                $("#camera-x-value").html(space._pos_cam[0]);
            }
            else if ($(this).text() === " > "){
                space._pos_cam[0] = space._pos_cam[0] + 1;
                $("#camera-x-value").html(space._pos_cam[0]);
            }
        }
        
        if ($(this).siblings("p").text() === "Camera Y :"){
            if ($(this).text() === " < "){
                space._pos_cam[1] = space._pos_cam[1] - 1;
                $("#camera-y-value").html(space._pos_cam[1]);
            }
            else if ($(this).text() === " > "){
                space._pos_cam[1] = space._pos_cam[1] + 1;
                $("#camera-y-value").html(space._pos_cam[1]);
            }
        }

        if ($(this).siblings("p").text() === "Camera Z :"){
            if ($(this).text() === " < "){
                space._pos_cam[2] = space._pos_cam[2] - 1;
                $("#camera-z-value").html(space._pos_cam[2]);
            }
            else if ($(this).text() === " > "){
                space._pos_cam[2] = space._pos_cam[2] + 1;
                $("#camera-z-value").html(space._pos_cam[2]);
            }
        }

        if ($(this).siblings("p").text() === "Fov-Y :"){
            if ($(this).text() === " < "){
                space._fovy = space._fovy - 1;
                $("#fovy-value").html(space._fovy);
            }
            else if ($(this).text() === " > "){
                space._fovy = space._fovy + 1;
                $("#fovy-value").html(space._fovy);
            }
        }

        if ($(this).siblings("p").text() === "Elevation :"){
            if ($(this).text() === " < "){
                space._elev = space._elev - 1;
                $("#elev-value").html(space._elev);
            }
            else if ($(this).text() === " > "){
                space._elev = space._elev + 1;
                $("#elev-value").html(space._elev);
            }
        }

        if ($(this).siblings("p").text() === "Angle :"){
            if ($(this).text() === " < "){
                space._ang = space._ang - 1;
                $("#angle-value").html(space._ang);
            }
            else if ($(this).text() === " > "){
                space._ang = space._ang + 1;
                $("#angle-value").html(space._ang);
            }
        }

        if ($(this).siblings("p").text() === "w :"){
            if ($(this).text() === " < "){
                space._w = space._w - 1;
                $("#w-value").html(space._w);
            }
            else if ($(this).text() === " > "){
                space._w = space._w + 1;
                $("#w-value").html(space._w);
            }
        }

        if ($(this).siblings("p").text() === "h :"){
            if ($(this).text() === " < "){
                space._h = space._h - 1;
                $("#h-value").html(space._h);
            }
            else if ($(this).text() === " > "){
                space._h = space._h + 1;
                $("#h-value").html(space._h);
            }
        }

        if ($(this).siblings("p").text() === "n :"){
            if ($(this).text() === " < "){
                space._n = space._n - 1;
                $("#n-value").html(space._n);
            }
            else if ($(this).text() === " > "){
                space._n = space._n + 1;
                $("#n-value").html(space._n);
            }
        }

        if ($(this).siblings("p").text() === "f :"){
            if ($(this).text() === " < "){
                space._f = space._f - 1;
                $("#f-value").html(space._f);
            }
            else if ($(this).text() === " > "){
                space._f = space._f + 1;
                $("#f-value").html(space._f);
            }
        }

        /*<-------- Lights -------->*/

        if ($(this).siblings("p").text() === "Light Pos X :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_pos[0] = setup.globalsLight.l_pos[0] - 0.1;
                $("#l_pos-x-value").html(setup.globalsLight.l_pos[0]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_pos[0] = setup.globalsLight.l_pos[0] + 0.1;
                $("#l_pos-x-value").html(setup.globalsLight.l_pos[0]);
            }
        }

        if ($(this).siblings("p").text() === "Light Pos Y :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_pos[1] = setup.globalsLight.l_pos[1] - 0.1;
                $("#l_pos-y-value").html(setup.globalsLight.l_pos[1]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_pos[1] = setup.globalsLight.l_pos[1] + 0.1;
                $("#l_pos-y-value").html(setup.globalsLight.l_pos[1]);
            }
        }

        if ($(this).siblings("p").text() === "Light Pos Z :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_pos[2] = setup.globalsLight.l_pos[2] - 0.1;
                $("#l_pos-z-value").html(setup.globalsLight.l_pos[2]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_pos[2] = setup.globalsLight.l_pos[2] + 0.1;
                $("#l_pos-z-value").html(setup.globalsLight.l_pos[2]);
            }
        }

        if ($(this).siblings("p").text() === "Light Dir X :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_dir[0] = setup.globalsLight.l_dir[0] - 0.1;
                $("#l_dir-x-value").html(setup.globalsLight.l_dir[0]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_dir[0] = setup.globalsLight.l_dir[0] + 0.1;
                $("#l_dir-x-value").html(setup.globalsLight.l_dir[0]);
            }
        }

        if ($(this).siblings("p").text() === "Light Dir Y :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_dir[1] = setup.globalsLight.l_dir[1] - 0.1;
                $("#l_dir-y-value").html(setup.globalsLight.l_dir[1]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_dir[1] = setup.globalsLight.l_dir[1] + 0.1;
                $("#l_dir-y-value").html(setup.globalsLight.l_dir[1]);
            }
        }

        if ($(this).siblings("p").text() === "Light Dir Z :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_dir[2] = setup.globalsLight.l_dir[2] - 0.1;
                $("#l_dir-z-value").html(setup.globalsLight.l_dir[2]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_dir[2] = setup.globalsLight.l_dir[2] + 0.1;
                $("#l_dir-z-value").html(setup.globalsLight.l_dir[2]);
            }
        }

        if ($(this).siblings("p").text() === "Ball Light Pos X :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_ball_pos[0] = setup.globalsLight.l_ball_pos[0] - 0.1;
                $("#l_ball_pos-x-value").html(setup.globalsLight.l_ball_pos[0]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_ball_pos[0] = setup.globalsLight.l_ball_pos[0] + 0.1;
                $("#l_ball_pos-x-value").html(setup.globalsLight.l_ball_pos[0]);
            }
        }

        if ($(this).siblings("p").text() === "Ball Light Pos Y :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_ball_pos[1] = setup.globalsLight.l_ball_pos[1] - 0.1;
                $("#l_ball_pos-y-value").html(setup.globalsLight.l_ball_pos[1]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_ball_pos[1] = setup.globalsLight.l_ball_pos[1] + 0.1;
                $("#l_ball_pos-y-value").html(setup.globalsLight.l_ball_pos[1]);
            }
        }

        if ($(this).siblings("p").text() === "Ball Light Pos Z :"){
            if ($(this).text() === " < "){
                setup.globalsLight.l_ball_pos[2] = setup.globalsLight.l_ball_pos[2] - 0.1;
                $("#l_ball_pos-z-value").html(setup.globalsLight.l_ball_pos[2]);
            }
            else if ($(this).text() === " > "){
                setup.globalsLight.l_ball_pos[2] = setup.globalsLight.l_ball_pos[2] + 0.1;
                $("#l_ball_pos-z-value").html(setup.globalsLight.l_ball_pos[2]);
            }
        }
    });
});