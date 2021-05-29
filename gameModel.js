class Arkanoid {
	constructor(params) {
		console.log("Preparing the game...")
		this.params = params
		this.state = "Starting"
		this.ballAngle = 90
		this.balPosition = [0,0]
		this.barPosition = [0,-1]
		this.one = true
		document.onkeydown = (keyDownEvent) => this.keyDown(keyDownEvent)
		// window.addEventListener("keydown", this.keyDown, false);
	}

	keyDown(e){
		console.log(this.params,e);
		if (e.code=="Escape") this.state = "Pause"
		switch (this.state) {
			case "Pause":
			case "Won":
				//don't care
				break;
			case "Starting":
				switch (e.code){
					// starting position bar to right
					case "ArrowLeft":
					case "KeyA":
						this.barPosition[0]--;
						break;
					// starting position bar to left
					case "KeyD":
					case "ArrowRight":
						this.barPosition[0]++;
						break;
					// starting direction ball counter-clockwise
					case "ArrowUp":
					case "KeyW":
						this.ballAngle++;
						break;
					// starting direction ball clockwise
					case "KeyS":
					case "ArrowDown":
						this.ballAngle--;
						break;
					// start game
					case "Space":
						this.state = "Playing"
						break;
				}
				break;
			case "Playing":
				switch (e.code){
					// position bar
					case "ArrowLeft":
					case "KeyA":
						this.barPosition[0]--;
						break;
					// position bar
					case "KeyD":
					case "ArrowRight":
						this.barPosition[0]++;
						break;
				}
				break;	
			default:
				break;
		}
	}

	play() {                    
		switch (this.state) {
			case "Pause":
			case "Won":
				console.log(this.state)
				this.one = true
				//don't care
				break;
			case "Starting":
			case "Playing":
				if (this.one) console.log(this.state)
				if (this.one) this.one = ! this.one
				// change keybindings
				// fetch data
					// check collisions
						// modify coordinate and direction
				requestAnimationFrame(this.drawScene);
				
				break;	
			default:
				break;
		}
	}
	drawScene() {
		//this function must work with globals   
		switch (game.state) {
			case "Starting":
			case "Playing":
				console.log(game.state,game.balPosition,game.ballAngle,game.barPosition)
				requestAnimationFrame(game.drawScene);
				break;                    
			default:
				console.log("Block refresh");
				break;
		}
	}
}
const game = new Arkanoid(1);
game.play()