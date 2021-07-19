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

    touchStart(e){
        var touches = e.changedTouches;
	    game.velocityBar = 0.025;
        for (var i = 0; i < touches.length; i++) {
            var el = touches[i];
            var hookerObject = "bar";
            var splitter = el.clientX/window.innerWidth;
            if (splitter>0.25 && splitter<0.75) doubletap();
            if(game.state=="Starting" && el.clientY/window.innerHeight<0.5) hookerObject= "ball";
            switch (hookerObject) {
                case "bar":
                    if(splitter<0.25) hookerObject = "ArrowLeft";
                    else if (splitter>0.75) hookerObject = "ArrowRight";
                    break;
                case "ball":
                    if(splitter<0.25) hookerObject = "ArrowUp";
                    else if (splitter>0.75) hookerObject = "ArrowDown";
                    break;
            }
            el.code = hookerObject;
            input._ongoingTouches.push(copyTouch(el));
            game.keyDown(el);
        }
    },
    touchEnd(e){
        var touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++)
            for (let i = 0; i < input._ongoingTouches.length; i++)
                if (input._ongoingTouches[i].identifier === touches[i].identifier){
                    console.log("end",input._ongoingTouches[i]);
                    input.keyUp(input._ongoingTouches[i]);
                    input._ongoingTouches.splice(e.identifier, 1);
                }
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
