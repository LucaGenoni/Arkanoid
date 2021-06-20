var input = {
    _active: "nothing",
    keyDown : function (e) {
        // console.log("input (",this._active,"): ",e)
        game.keyDown(e);
        switch (e.key) {
            case "0":
                this._active = "nothing";
                break;
            case "1":
                this._active = "spaces";
                break;
            case "2":
                this._active = "lights";
                break;
            default:
                break;
        }
        switch (this._active) {
            case "spaces":
                space.keyDown(e);
                break;
            case "lights":
                // lights.keyDown(e)
                break;
            default:
                break;
        }
    }
};

window.addEventListener("keydown", input.keyDown, false);
// document.onkeydown = (keyDownEvent) => input.keyDown(keyDownEvent);
