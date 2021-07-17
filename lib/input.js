var input = {
    _active: "nothing",
    keyDown: function (e) {
        // console.log("input (",this._active,"): ",e)
        game.keyDown(e);
        switch (e.key) {
            case "0":
                this._active = "nothing";
                console.log("diable");
                // TODO niente icona 
                break;
            case "1":
                this._active = "camera";
                console.log("modify camera");
                // TODO icona camera
                break;
            case "2":
                this._active = "lights";
                console.log("modify lights");
                // TODO icona lampadina
                break;
            default:
                break;
        }
        switch (this._active) {
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
        doubletap()
	    game.velocityBar = 0.025;
        for (var i = 0; i < touches.length; i++) {
            var el = touches[i]
            var hookerObject = "bar|ball"
            if(el.clientY/window.innerHeight<0.5) hookerObject= "ball"
            else hookerObject= "bar"
            el["hookerObject"] = hookerObject;
            input._ongoingTouches.push(copyTouch(el));
            console.log("touchstart:" + i + "=>" + el.hookerObject);
        }
    },
    touchMove(e){
        var touches = e.changedTouches;
        if(input._ongoingTouches.length==e.changedTouches.length){
            
            for (var i = 0; i < touches.length; i++) {
                var evt = {code:""}
                var splitter = touches[i].clientX/window.innerWidth
                switch (input._ongoingTouches[i].hookerObject) {
                    case "bar":
                        if(splitter<0.25) evt.code = "ArrowLeft"
                        else if (splitter>0.75) evt.code = "ArrowRight"
                        break;
                    case "ball":
                        if(splitter<0.25) evt.code = "ArrowUp"
                        else if (splitter>0.75) evt.code = "ArrowDown"
                        break;
                }
                game.keyDown(evt);
            }
        }

    },
    touchEnd(e){
        console.log("end")
        var touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++)
            for (let i = 0; i < input._ongoingTouches.length; i++)
                if (input._ongoingTouches[i].identifier==touches[i].identifier)
                    input._ongoingTouches.splice(e.identifier, 1);
    }
};

var mylatesttap;
function doubletap() {
    var now = new Date().getTime();
    var timesince = now - mylatesttap;
    if((timesince < 600) && (timesince > 0)) game.keyDown({code:"Space"});
    mylatesttap = new Date().getTime();
}
function copyTouch({ identifier, clientX, clientY, hookerObject }) {
    return { identifier, clientX, clientY, hookerObject };
}
window.addEventListener("keydown", input.keyDown, false);
window.addEventListener("touchstart", input.touchStart, false);
window.addEventListener("touchmove", input.touchMove, false);
window.addEventListener("touchend", input.touchEnd, false);
// document.onkeydown = (keyDownEvent) => input.keyDown(keyDownEvent);
