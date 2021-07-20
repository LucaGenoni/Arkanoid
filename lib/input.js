var input = {
    _active: "nothing",
    keyUp(e) {
        game.keyUp(e)
    },
    keyDown(e) {
        // console.log("input (",this._active,"): ",e)
        game.keyDown(e);
        switch (e.key) {
            case "0":
                input._active = "nothing";
                console.log("disable");
                break;
            case "1":
                input._active = "camera";
                console.log("modify camera");
                break;
            case "2":
                input._active = "lights";
                console.log("modify lights");
                break;
            default:
                break;
        }
        // menu commands
        switch (input._active) {
            case "camera":
                space.keyDown(e);
                break;
            case "lights":
                setup.lightsKeyDown(e);
                break;
            default:
                break;
        }
    },
    _ongoingTouches: [],
    _touchCommand: "",
    touchStart(e){
        
	    game.velocityBar = 0.025;
        var percMin = 0.30;
        var percMax = 0.70;
        if(input._touchCommand === ""){
            var el = e.changedTouches[0];
            var splitter = el.clientX/window.innerWidth;
            var hookerObject = "bar";
            if (splitter>percMin && splitter<percMax) doubletap();
            if(el.clientY/window.innerHeight<0.5) hookerObject= "ball";
            switch (hookerObject) {
                case "bar":
                    if(splitter<percMin) hookerObject = "ArrowLeft";
                    else if (splitter>percMax) hookerObject = "ArrowRight";
                    break;
                case "ball":
                    if(splitter<percMin) hookerObject = "ArrowUp";
                    else if (splitter>percMax) hookerObject = "ArrowDown";
                    break;
            }
            input._touchCommand = hookerObject;
            input.keyDown({code:hookerObject});
        }
        // var touches = e.changedTouches;
        // for (var i = 0; i < touches.length; i++) {
        //     var el = touches[i];
        //     var hookerObject = "bar";
        //     var splitter = el.clientX/window.innerWidth;
        //     if (splitter>percMin && splitter<percMax) doubletap();
        //     if(game.state=="Starting" && el.clientY/window.innerHeight<0.5) hookerObject= "ball";
        //     switch (hookerObject) {
        //         case "bar":
        //             if(splitter<percMin) hookerObject = "ArrowLeft";
        //             else if (splitter>percMax) hookerObject = "ArrowRight";
        //             break;
        //         case "ball":
        //             if(splitter<percMin) hookerObject = "ArrowUp";
        //             else if (splitter>percMax) hookerObject = "ArrowDown";
        //             break;
        //     }
        //     el.code = hookerObject;
        //     input._ongoingTouches.push(copyTouch(el));
        // }
    },
    touchEnd(e){
        input.keyUp({code:input._touchCommand});
        input._touchCommand = ""
        // var touches = e.changedTouches;
        // for (let i = 0; i < touches.length; i++)
        //     for (let i = 0; i < input._ongoingTouches.length; i++)
        //         if (input._ongoingTouches[i].identifier === touches[i].identifier){
        //             // input.keyUp(input._ongoingTouches[i]);
        //             input._ongoingTouches.splice(e.identifier, 1);
        //         }
    }
};

var mylatesttap;
function doubletap() {
    var now = new Date().getTime();
    var timesince = now - mylatesttap;
    if((timesince < 600) && (timesince > 0)) game.keyDown({code:"Space"});
    mylatesttap = new Date().getTime();
}
function copyTouch({ identifier, clientX, clientY, code }) {
    return { identifier, clientX, clientY, code };
}
window.addEventListener("keydown", input.keyDown, false);
window.addEventListener("keyup", input.keyUp, false);
window.addEventListener("touchstart", input.touchStart, false);
window.addEventListener("touchend", input.touchEnd, false);
// document.onkeydown = (keyDownEvent) => input.keyDown(keyDownEvent);
