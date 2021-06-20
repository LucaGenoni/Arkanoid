vs = `#version 300 es

in vec4 a_position;

uniform mat4 u_matrix;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  gl_Position = u_matrix * a_position;
}
`
fs = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
   outColor = u_color;
}
`;
class Arkanoid {
	constructor(params) {
		console.log("Preparing the game...");
		this.params = params;
		this.state = "Starting";
		this.isGameStopped = true;
		
		this.ballAngle = 90;

		var ballPosition = [0.0,-0.8];
		var barPosition = [0,-1];
		
		this.score = 0;
		this.lives = 3;
		this.pity = 0;
		
		this.velocity = 0.02;
		this.velocityBar = 0.02;
		
		// document.onkeydown = (keyDownEvent) => this.keyDown(keyDownEvent);
		// window.addEventListener("keydown", this.keyDown, false);
		// 
		this.geometryBlock = {	//block
			position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
			normal: [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
			texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
			indices: [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
		};
		
		this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);
		twgl.setAttributePrefix("a_");
		var colors = [[1, 0.250980392, 0, 1],[1, 0.501960784, 0, 1],[1, 0.749019608, 0, 1],[1, 1, 0, 1],[0.749019608, 1, 0, 1],[0.501960784, 1, 0, 1],[0.250980392, 1, 0, 1],[0, 1, 0, 1],[0, 1, 0.250980392, 1],[0, 1, 0.501960784, 1],[0, 1, 0.749019608, 1],[0, 1, 1, 1],[0, 0.749019608, 1, 1],[0, 0.501960784, 1, 1],[0, 0.250980392, 1, 1],[0, 0, 1, 1],[0.250980392, 0, 1, 1],[0.501960784, 0, 1, 1],[0.749019608, 0, 1, 1],[1, 0, 1, 1],[1, 0, 0.749019608, 1],[1, 0, 0.501960784, 1],[1, 0, 0.250980392, 1],[1, 0, 0, 1],];
		var dimensionsBAR = [0.2,0.1,0.1]
		this.bar = {
			//uniforms like color, textures and other things
			 
			center:[barPosition[0],barPosition[1],0],
			dimensions: dimensionsBAR,
			spigoli:[],
			uniforms: { 
				u_color: [185/255, 122/255, 87/255, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(barPosition[0],barPosition[1],0),
					utils.MakeScaleNuMatrix(0.2,0.1,0.1)
				))
			},	
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
		}
		this.updateSpigoliObject(this.bar);
		this.ball = {
			//uniforms like color, textures and other things
			center: ballPosition,
			direction:[Math.cos(utils.degToRad(this.ballAngle)),Math.sin(utils.degToRad(this.ballAngle)),0],
			radius:0.1,
			uniforms: { 
				u_color: [1, 1, 1, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(ballPosition[0],ballPosition[1],0),
					utils.MakeScaleNuMatrix(0.1,0.1,0.1)
				))
			},	
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, buildGeometry(20,20)),
		}

		this.block = [];
		this.powerUps = [];
		// loading meshes blocks
		for (var x = 0; x < map.length; x++){
			for (var y = 0; y < map[x].length; y++){
				var typeBlock = map[x][y];
				if (typeBlock != 0){ //to add different typeblock make more cases with 1,2,3 block
					var signleColor = Math.floor(Math.random() * colors.length);
					var coordinate = [(2*x-map.length+1)/map.length,(2*y-map[x].length+1)/map[x].length,0];
					var scaling = 0.1;

					// add to the list a block hiding a powerup, and also add the powerup to its list
					// (powerup hidden behind the block only if randomly extracted by willHavePowerUp, and if the number
					// of upgrades already hidden doesn't overcome the limit)
					if (this.willHavePowerUp() && this.powerUps.length <= Math.floor(this.block.length / 5)){

						this.powerUps.push(new powerUp(this, this.powerUps.length + 1));
						
						this.block.push({
							hasPowerUp: true,
							id: this.powerUps.length,
							//uniforms like color, textures and other things						
							center:coordinate,
							dimensions: [scaling,scaling,scaling],
							spigoli:[],
							localMatrix : utils.multiplyMatrices(
								utils.MakeTranslateMatrix(coordinate[0],coordinate[1],0),
								utils.MakeScaleMatrix(scaling)
							),
							uniforms: {
								u_color: colors[signleColor],
								// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
								u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
									utils.MakeTranslateMatrix(coordinate[0],coordinate[1],0),
									utils.MakeScaleMatrix(scaling)
								))
							},
							//shaders
							programInfo: this.programInfo,
							//geometry
							bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
						});
					}
					
					//add to the list a block without a powerup
					else {
						this.block.push({
							hasPowerUp: false,
							//uniforms like color, textures and other things						
							center:coordinate,
							dimensions: [scaling,scaling,scaling],
							spigoli:[],
							localMatrix : utils.multiplyMatrices(
								utils.MakeTranslateMatrix(coordinate[0],coordinate[1],0),
								utils.MakeScaleMatrix(scaling)
							),
							uniforms: {
								u_color: colors[signleColor],
								// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
								u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
									utils.MakeTranslateMatrix(coordinate[0],coordinate[1],0),
									utils.MakeScaleMatrix(scaling)
								))
							},
							//shaders
							programInfo: this.programInfo,
							//geometry
							bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
						});
					}
					
					
					this.updateSpigoliObject(this.block[x]);
				}
			}
		}
	}
	
	
	keyDown(e){
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
						var tempChange = this.bar.center[0] - this.velocityBar;
						if(tempChange>-1+this.bar.dimensions[0]) this.bar.center[0] = tempChange;
						else this.bar.center[0] = -1 + this.bar.dimensions[0];
						this.updateSpigoliObject(this.bar);
						this.ball.center[0] = this.bar.center[0];
						break;
					// starting position bar to left
					case "KeyD":
					case "ArrowRight":
						var tempChange = this.bar.center[0] + this.velocityBar;
						if(tempChange<1-this.bar.dimensions[0]) this.bar.center[0] = tempChange;
						else this.bar.center[0] = 1 - this.bar.dimensions[0];
						this.updateSpigoliObject(this.bar);
						this.ball.center[0] = this.bar.center[0];
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
						this.ball.direction = [Math.cos(utils.degToRad(this.ballAngle)),Math.sin(utils.degToRad(this.ballAngle)),0];
						this.state = "Playing"
						break;
				}
				break;
			case "Playing":
				switch (e.code){
					// position bar
					case "ArrowLeft":
					case "KeyA":
						var tempChange = this.bar.center[0] - this.velocityBar;
						if(tempChange>-1+this.bar.dimensions[0]) this.bar.center[0] = tempChange;
						else this.bar.center[0] = -1 + this.bar.dimensions[0];
						this.updateSpigoliObject(this.bar);
						break;
					// position bar
					case "KeyD":
					case "ArrowRight":
						var tempChange = this.bar.center[0] + this.velocityBar;
						if(tempChange<1-this.bar.dimensions[0]) this.bar.center[0] = tempChange;
						else this.bar.center[0] = 1 - this.bar.dimensions[0];
						this.updateSpigoliObject(this.bar);
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
				console.log(this.state);
				this.isGameStopped = true;
				//don't care
				break;
			case "Starting":
			case "Playing":
				if (this.isGameStopped) {
					console.log(this.state)
					this.isGameStopped = ! this.isGameStopped
				}
				requestAnimationFrame(this.render);
				break;	
			default:
				break;
		}
	}
	
	render(time) {		
		//this function must work with globals   
		switch (game.state) {
			case "Starting":
				
				game.drawGame();
				break;     
			case "Playing":
				var angle = Math.acos(game.ball.direction[0]);
				var correction = 0.03;
				if (Math.abs(angle - 1.570796326794896)<correction){
					console.log(angle);
					game.ballAngle = angle + correction - 2*correction*(angle<1.57079);
					game.ball.direction = [Math.cos(game.ballAngle),Math.sin(game.ballAngle),0];
				}
				// update position of the ball
				game.ball.center[0] = game.ball.center[0] + game.ball.direction[0]*game.velocity;
				game.ball.center[1] = game.ball.center[1] + game.ball.direction[1]*game.velocity;

				// check collisioni con sponde
				if(Math.abs(game.ball.center[0])>1-game.ball.radius) game.ball.direction[0] = -game.ball.direction[0];
				if(game.ball.center[1]>1-game.ball.radius) game.ball.direction[1] = -game.ball.direction[1];
				if(game.ball.center[1]<-1+game.ball.radius) {
					console.log("lost a life or the game");
					game.state = "Pause";
					game.handleLifeLoss();
					break;
				}
				// collisioni con prismi 
				game.collision(game.bar);
				for (let i = 0; i < game.block.length; i++) {
					if(game.collision(game.block[i])>0){
						game.block.splice(i, 1);
						game.updateScore();
					}
				}
				game.drawGame();
				break;                    
			default:
				console.log("Block refresh");
				break;
		}
	}
	
	drawSingleObject(item){		
		gl.useProgram(item.programInfo.program);
		twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);
		twgl.setUniforms(item.programInfo, item.uniforms);
		twgl.drawBufferInfo(gl, item.bufferInfo);
	}

	updateSpigoliObject(obj){
		if(obj){
			obj.spigoli = [
				[(obj.center[0] + obj.dimensions[0]),(obj.center[1] + obj.dimensions[1]),0],
				[(obj.center[0] + obj.dimensions[0]),(obj.center[1] - obj.dimensions[1]),0],
				[(obj.center[0] - obj.dimensions[0]),(obj.center[1] + obj.dimensions[1]),0],
				[(obj.center[0] - obj.dimensions[0]),(obj.center[1] - obj.dimensions[1]),0]
			];
		}
	}

	collision(obj){
		var xaxis = Math.abs(game.ball.center[0] - obj.center[0]) - obj.dimensions[0];
		var yaxis = Math.abs(game.ball.center[1] - obj.center[1]) - obj.dimensions[1];
		
		if(xaxis<=0 && yaxis<game.ball.radius){
			// collision on xaxis
			console.log("collision detected on yaxis bar");
			game.ball.direction[1] = -game.ball.direction[1];
			game.ball.center[1] = game.ball.center[1] + game.ball.direction[1]*game.velocity;
			return 1

		}else if(yaxis<0 && xaxis<game.ball.radius){
			// collision on yaxis
			console.log("collision detected on xaxis bar");
			game.ball.direction[0] = -game.ball.direction[0];
			game.ball.center[0] = game.ball.center[0] + game.ball.direction[0]*game.velocity;
			return 2

		}else if(xaxis<game.ball.radius &&yaxis<game.ball.radius){
			// possible collision on the edge
			for(var j=0;j< obj.spigoli.length;j++){
				xaxis = game.ball.center[0] - obj.spigoli[j][0];
				yaxis = game.ball.center[1] - obj.spigoli[j][1];
				// pitagora
				if((xaxis**2 + yaxis**2 - game.ball.radius**2)<0){
					console.log("collision detected on spigolo bar");
					var angle = Math.acos(game.ball.direction[0]);
					
					game.ball.direction[0] = -game.ball.direction[0];
					game.ball.direction[1] = -game.ball.direction[1];
					
					game.ball.center[0] = game.ball.center[0] + game.ball.direction[0]*game.velocity;
					game.ball.center[1] = game.ball.center[1] + game.ball.direction[1]*game.velocity;
					// TODO correggere il rimbalzo in decente con i vettori
					// TODO check con l'orizzontale cos(1)
					return 3;
				};
			}
		}
		return 0;
	}


	drawGame(){
		
		var VP = utils.multiplyMatrices(space.getPerspective(),space.getView())
		game.ball.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
			VP,utils.multiplyMatrices(
			utils.MakeTranslateMatrix(game.ball.center[0],game.ball.center[1],0),
			utils.MakeScaleNuMatrix(0.1,0.1,0.1)
		)));
		
		game.bar.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
			VP,utils.multiplyMatrices(
			utils.MakeTranslateMatrix(game.bar.center[0],game.bar.center[1],0),
			utils.MakeScaleNuMatrix(0.2,0.1,0.1)
		)));
		game.block.forEach(e => {
			e.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(VP,e.localMatrix))
		});
		
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
		game.drawSingleObject(game.bar);
		game.drawSingleObject(game.ball);
		twgl.drawObjectList(gl, game.block);
		requestAnimationFrame(game.render);
	}
	
	drawSingleObject(item){		
		gl.useProgram(item.programInfo.program);
		twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);
		twgl.setUniforms(item.programInfo, item.uniforms);
		twgl.drawBufferInfo(gl, item.bufferInfo);
	}
	
	willHavePowerUp(){
		var prob = Math.random();

		// randomically decides to add a powerup or not to the block: subsequent negative cases result in an increase 
		// of the pity, which increases the probability that the next block will have a powerup
		if (Math.random() + this.pity > 0.6){
			this.pity = 0;
			return true;
		}
		
		else {
			this.pity += 0.1;
			return false;
		}
	}

	/* <----------------- Functions for UI -----------------> */
	
	updateScore(){
		//TODO: score modification to be changed considering the time spent playing, 
		// the active upgrade's score multiplier and whatever else we feel is needed
		
		this.score+=10;
		$(".ui-score").text("Score: " + this.score);
		
		//check win condition
		if (this.block.length === 0){
			this.state = "Won";
			$("#victory-score").text("Your score: " + this.score);
			document.getElementById('victory-screen').style.display = "block";
		}
	}

	handleLifeLoss(){
		this.lives-=1;

		//handling cases where player still has 1-2 lives left
		if (this.lives + 1 === 3){
			document.getElementById('life-3').style.display = "none";
			this.ballAngle = 90;
			this.ball.center = [0.0,-0.8];
			this.bar.center = [0,-1];
			this.state = "Starting";
			this.play();
		}

		else if (this.lives + 1 === 2){
			document.getElementById('life-2').style.display = "none";
			this.ballAngle = 90;
			this.ball.center = [0.0,-0.8];
			this.bar.center = [0,-1];
			this.state = "Starting";
			this.play();
		}

		//handling case where the player has no lives left: LOSS
		else if (this.lives + 1 === 1){
			document.getElementById('life-1').style.display = "none";
			this.state = "Pause";
			document.getElementById('lost-screen').style.display = "block";
		}
	}

}