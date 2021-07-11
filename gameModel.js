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
vsBLOCK = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  v_texcoord = a_texcoord;
  gl_Position = u_matrix * a_position;
}
`
fsBLOCK = `#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_colorText;

out vec4 outColor;

void main() {
   	outColor = texture(u_colorText, v_texcoord);
}
`;
class Arkanoid {
	constructor(mapBlocks,velocityBall,velocityBar) {
		console.log("Preparing the game...");
		this.velocityBall = velocityBall ? velocityBall:0.025;
		this.velocityBar = velocityBar ? velocityBar:0.05;
		this.previousState = "Pause";
		this.state = "Starting";
		this.ballAngle = 90;

		this.score = 0;
		this.lives = 3;
		this.pity = 0;
		
		this.gameStart = Date.now() / 1000;
		this.gameEnd = 0;

		this.powerUpVelocity = 0.005;

	
		// CREATE SHADERS
		
		this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);
		this.programInfoBLOCK = twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]);
		twgl.setAttributePrefix("a_");
		var colors = [[1, 0.250980392, 0, 1], [1, 0.501960784, 0, 1], [1, 0.749019608, 0, 1], [1, 1, 0, 1], [0.749019608, 1, 0, 1], [0.501960784, 1, 0, 1], [0.250980392, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0.250980392, 1], [0, 1, 0.501960784, 1], [0, 1, 0.749019608, 1], [0, 1, 1, 1], [0, 0.749019608, 1, 1], [0, 0.501960784, 1, 1], [0, 0.250980392, 1, 1], [0, 0, 1, 1], [0.250980392, 0, 1, 1], [0.501960784, 0, 1, 1], [0.749019608, 0, 1, 1], [1, 0, 1, 1], [1, 0, 0.749019608, 1], [1, 0, 0.501960784, 1], [1, 0, 0.250980392, 1], [1, 0, 0, 1],];

		var dimensions, coordinate, uniform, newObj, name;

		// CREATE BAR
		dimensions = [0.3, 0.01, 0.1];
		coordinate = [0, -1, 0];
		uniform = {
			u_color: [185 / 255, 122 / 255, 87 / 255, 1],
			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			))
		}
		newObj = setup.newObject("Bar",coordinate,dimensions,uniform, setup.shaders.justColor, setup.geometries.cube );
		this.bar = newObj;

		// CREATE EDGES
		this.sponde = [];
		for (x = 0; x < 3; x++) {
			switch (x) {
				case 0:
					name = "sponda SX";
					coordinate = [-1, 0, 0];
					dimensions = [0, 1, .1];
					break;
				case 1:
					name = "sponda TOP";
					coordinate = [0, 1, 0];
					dimensions = [1, 0, .1];
					break;
				case 2:
					name = "sponda DX";
					coordinate = [1, 0, 0];
					dimensions = [0, 1, .1];
					break;
				default:
					break;
			}
			uniform = {
				u_color: colors[Math.floor(Math.random() * colors.length)],
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
					utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
				))
			}
			// create sponda
			newObj = setup.newObject(name,coordinate,dimensions,uniform, setup.shaders.justColor, setup.geometries.cube );
			newObj.localMatrix = utils.multiplyMatrices(
				utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			)
			this.sponde.push(newObj);
		}

		// CREATE BALL
		dimensions = 0.05;
		coordinate = [0.0, this.bar.center[1] + dimensions + this.bar.dimensions[1]];
		uniform = {
			u_color: [1, 1, 1, 1],
			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
				utils.MakeScaleMatrix(dimensions)
			))
		}
		newObj = setup.newObject("Ball",coordinate,dimensions,uniform, setup.shaders.justColor, setup.geometries.sphere );
		newObj.radius = dimensions;
		newObj.direction = [Math.cos(utils.degToRad(this.ballAngle)), Math.sin(utils.degToRad(this.ballAngle)), 0],
		this.ball = newObj


		// CREATE ARROW
		coordinate = this.ball.center;
		dimensions = [0.2,0.01,0.01];
		uniform = {
			u_color: [124/255,252/255,0,0],
			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			))
		}
		newObj = setup.newObject("Arrow",function () { return game.ball.center;},dimensions,uniform, setup.shaders.justColor, setup.geometries.sphere );
		newObj.updateLocal = function () {
			this.localMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(game.ball.center[0], game.ball.center[1], 0),
				utils.MakeRotateZMatrix(game.ballAngle)),
				utils.MakeTranslateMatrix(this.dimensions[0], this.dimensions[1], 0)),
				utils.MakeScaleNuMatrix(this.dimensions[0], this.dimensions[1], this.dimensions[2])
			)
		}
		newObj.localMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
			utils.MakeTranslateMatrix(this.ball.center[0], this.ball.center[1], 0),
			utils.MakeRotateZMatrix(this.ballAngle)),
			utils.MakeTranslateMatrix(dimensions[0], dimensions[1], 0)),
			utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
		)
		this.arrow = newObj


		// CREATE BLOCKS (AND INITIALIZE POWERUPS LIST)

		this.block = [];
		this.powerup = [];
		var power;
		var powerUpsCount = 0;
		for (var x = 0; x < mapBlocks.length; x++) {
			for (var y = 0; y < mapBlocks[x].length; y++) {
				var typeBlock = mapBlocks[x][y];
				if (typeBlock != 0) { //to add different typeblock make more cases with 1,2,3 block
					var signleColor = Math.floor(Math.random() * colors.length);
					coordinate = [(2 * x - mapBlocks.length + 1) / mapBlocks.length, (2 * y - mapBlocks[x].length + 1) / mapBlocks[x].length, 0];
					dimensions = [1 / mapBlocks.length, 1 / mapBlocks[x].length, 0.1];
					power = false;
					if (this.willHavePowerUp()) {
						power = true;
						powerUpsCount += 1;
					}
					// create block
					uniform = {
						u_color: colors[signleColor],
						u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
							utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
						))
					}
					newObj = setup.newObject("Block " + this.block.length, coordinate, dimensions, uniform, setup.shaders.justColor, setup.geometries.cube );
					newObj.localMatrix = utils.multiplyMatrices(
						utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
						utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
					),
					newObj.hasPowerUp = power,
					newObj.powerUpType = Math.floor(4* Math.random()) + 1, //identifies the upgrade (possible values: 1, 2, 3, 4),
					this.block.push(newObj);
				}
			}
		}
		
		// create attributes for collision detection
		this.updateSpigoliObject(this.bar);
		for (x = 0; x < this.block.length; x++) this.updateSpigoliObject(this.block[x]);
		for (x = 0; x < this.sponde.length; x++) this.updateSpigoliObject(this.sponde[x]);
	}


	keyDown(e) {
		switch (e.code) {
			// starting position bar to right
			case "Escape":
				this.changeState("Pause");
				return;
			// position bar 
			case "ArrowLeft":
			case "KeyA":
				var tempChange = this.bar.center[0] - this.velocityBar;
				if (tempChange > -1 + this.bar.dimensions[0]) this.bar.center[0] = tempChange;
				else this.bar.center[0] = -1 + this.bar.dimensions[0];
				if (this.state == "Starting") {
					this.ball.center[0] = this.bar.center[0];
					this.arrow.updateLocal();
				}
				this.updateSpigoliObject(this.bar);
				return;
			case "KeyD":
			case "ArrowRight":
				var tempChange = this.bar.center[0] + this.velocityBar;
				if (tempChange < 1 - this.bar.dimensions[0]) this.bar.center[0] = tempChange;
				else this.bar.center[0] = 1 - this.bar.dimensions[0];
				if (this.state == "Starting") {
					this.ball.center[0] = this.bar.center[0];
					this.arrow.updateLocal();
				}
				this.updateSpigoliObject(this.bar);
				return;
			// starting direction ball + counter-clockwise, - clockwise
			case "ArrowUp":
			case "KeyW":
				if (this.state == "Starting") {
					this.ballAngle++;
					this.arrow.updateLocal();
				}
				return;
			case "KeyS":
			case "ArrowDown":
				if (this.state == "Starting") {
					this.ballAngle--;
					this.arrow.updateLocal();
				}
				return;
			// start game
			case "Space":
				if (this.state == "Starting") {
					this.ball.direction = [Math.cos(utils.degToRad(this.ballAngle)), Math.sin(utils.degToRad(this.ballAngle)), 0];
					this.changeState("Playing")
				}
				return;
		}
		return;
	}

	changeState(newState) {
		if (newState == "Pause" && this.state == "Pause") return;
		this.previousState = this.state;
		this.state = newState;
	}

	resume() {
		this.changeState(this.previousState);
		requestAnimationFrame(this.play);
	}

	play(time) {
		//this function must work with globals   
		switch (game.state) {
			case "Starting":
				var VP = utils.multiplyMatrices(space.getPerspective(), space.getView())
				game.arrow.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
					VP, game.arrow.localMatrix))
				game.drawSingleObject(game.arrow);
				game.drawGame(VP);
				break;
			case "Playing":
				var angle = Math.acos(game.ball.direction[0]);
				var correction = 0.03;
				if (Math.abs(angle - 1.570796326794896) < correction) {
					console.log(angle);
					game.ballAngle = angle + correction - 2 * correction * (angle < 1.57079);
					game.ball.direction = [Math.cos(game.ballAngle), Math.sin(game.ballAngle), 0];
				}
				// update position of the ball
				game.ball.center[0] = game.ball.center[0] + game.ball.direction[0] * game.velocityBall;
				game.ball.center[1] = game.ball.center[1] + game.ball.direction[1] * game.velocityBall;
				
				//update position of each rendered power-up and check collisions
				for (let i = 0; i < game.powerup.length; i++){
					game.powerup[i].center[1] = game.powerup[i].center[1] - game.powerUpVelocity;

					//despawn the power-up if it goes past the bar or if the bar takes it
					if (game.powerup[i].center[1] < -1 - (2 * game.bar.dimensions[1]) || game.powerUpCollision(game.powerup[i])){
						game.powerup.splice(i, 1);
					}
				}

				// check lost condition
				if (game.ball.center[1] < -1 - game.ball.radius) {
					game.handleLifeLoss();
					return;
				}
				// collisions with objects
				if (game.collision(game.bar) > 0) {
					if (game.bugRecovery) {
						console.log("FUCKING BUG");
						game.handleLifeLoss();
						return;
					}
					game.bugRecovery = true;
				} else game.bugRecovery = false;
				for (let i = 0; i < game.sponde.length; i++) {
					if (game.collision(game.sponde[i]) > 1) {
						// TODO correction of direction depending on the type of sponda 
					}
				}
				for (let i = 0; i < game.block.length; i++) {
					if (game.collision(game.block[i]) > 0) {
						if (game.block[i].hasPowerUp){
							game.preparePowerUp(game.block[i].powerUpType, game.block[i].center, game.block[i].dimensions);
						}
						game.block.splice(i, 1);
						game.updateScore();
					}
				}
					
				space._w = gl.canvas.clientWidth;
				space._h = gl.canvas.clientHeight;
				var VP = utils.multiplyMatrices(space.getPerspective(), space.getView())
				game.drawGame(VP);
				break;
			default:
				console.log("Block refresh");
				break;
		}
	}

	drawSingleObject(item) {
		gl.useProgram(item.programInfo.program);
		twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);
		twgl.setUniforms(item.programInfo, item.uniforms);
		twgl.drawBufferInfo(gl, item.bufferInfo);
	}

	updateSpigoliObject(obj) {
		if (obj) {// check why i need to place it to avoid a BIG FUCKING CRASH!!!!!!!!!!!!!!ASJKFGHASKLGHASIGHAFGB 
			obj.min = [obj.center[0] - obj.dimensions[0], obj.center[1] - obj.dimensions[1], 0];
			obj.max = [obj.center[0] + obj.dimensions[0], obj.center[1] + obj.dimensions[1], 0]
		}
	}
	
	collision(obj) {
		var xaxis = Math.abs(game.ball.center[0] - obj.center[0]) - obj.dimensions[0];
		var yaxis = Math.abs(game.ball.center[1] - obj.center[1]) - obj.dimensions[1];

		if (xaxis <= game.ball.radius && yaxis <= game.ball.radius) {
			// collision detected

			var x = Math.max(obj.min[0], Math.min(game.ball.center[0], obj.max[0]));
			var y = Math.max(obj.min[1], Math.min(game.ball.center[1], obj.max[1]));
			// var z = Math.max(box.minZ, Math.min(sphere.z, box.maxZ));
			// distance between the closes point to the center of the sphere
			// var distance = Math.sqrt((x - sphere.x) **2 + (y - sphere.y) **2 + (z - sphere.z) **2);
			var distance = Math.sqrt((x - game.ball.center[0]) ** 2 + (y - game.ball.center[1]) ** 2);
			if (distance <= game.ball.radius) {
				console.log("collision with", obj.typeObj);
				var bounce = normalizeVector([x - game.ball.center[0], y - game.ball.center[1], 0]);
				game.ball.center[0] = game.ball.center[0] - game.ball.direction[0] * game.velocityBall;
				game.ball.center[1] = game.ball.center[1] - game.ball.direction[1] * game.velocityBall;
				game.ball.direction = normalizeVector(
					subVector(game.ball.direction,
						scalarVector(2 * dotProductVector(bounce, game.ball.direction) / dotProductVector(bounce, bounce),
							bounce)));
				game.ball.center[0] = game.ball.center[0] + 2 * game.ball.direction[0] * game.velocityBall;
				game.ball.center[1] = game.ball.center[1] + 2 * game.ball.direction[1] * game.velocityBall;
				return 1;
			}
		}
		return 0;
	}
	
	powerUpCollision(powerUp){
		var xDistance = Math.abs(powerUp.center[0] - game.bar.center[0]);
		var yDistance = Math.abs(powerUp.center[1] - game.bar.center[1]);
		var powerUpBar = powerUp.dimensions[0] + game.bar.dimensions[0];
		
		if (xDistance < powerUp.dimensions[0] + game.bar.dimensions[0] &&
			(powerUp.center[1] > game.bar.center[1] - game.bar.dimensions[1] && powerUp.center[1] < game.bar.center[1] + game.bar.dimensions[1]) ||
			yDistance <= (powerUp.dimensions[1] + game.bar.dimensions[1]) && powerUp.center[1] >= game.bar.center[1] + game.bar.dimensions[1])
		{
			game.POWERUPS[powerUp.powerUpType].apply();
			//TODO: APPLY THE EFFECTS OF THE POWER-UP TO THE GAME
			// MAKING THEM LAST A PRECISE AMOUNT OF TIME ACCORDING TO A SET TIMER
			
			console.log("You grabbed an upgrade " + powerUp.powerUpType);
			return true;
		}
		
		else {
			return false;
		}
	}
	
	//function to add a power-up to the list of power-up to be renderized
	preparePowerUp(powerUpType, blockCenter, dimensions){
		const shrk = 0.4; //shrinking factor to be applied to the scaling factors of the block
		// in order to represent the powerup as a shrunken block
		dimensions = scalarVector(shrk,dimensions);
		var uniform = {
			u_color: this.POWERUPS[powerUpType].color,
			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(blockCenter[0], blockCenter[1], 0),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			))
		}
		var newObj = setup.newObject("PowerUP "+powerUpType, blockCenter, dimensions, uniform, setup.shaders.justColor, setup.geometries.cube );
		newObj.powerUpType = powerUpType,
		this.powerup.push(newObj);
	}
	
	drawGame(VP) {

		game.ball.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
			VP, utils.multiplyMatrices(
				utils.MakeTranslateMatrix(game.ball.center[0], game.ball.center[1], 0),
				utils.MakeScaleMatrix(game.ball.radius)
			)));

		game.bar.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
			VP, utils.multiplyMatrices(
				utils.MakeTranslateMatrix(game.bar.center[0], game.bar.center[1], 0),
				utils.MakeScaleNuMatrix(game.bar.dimensions[0], game.bar.dimensions[1], game.bar.dimensions[2])
			)));
		
		game.block.forEach(e => {
			e.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(VP, e.localMatrix))
		});
		
		game.powerup.forEach(p => {
			p.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
				VP, utils.multiplyMatrices(
					utils.MakeTranslateMatrix(p.center[0], p.center[1], 0),
					utils.MakeScaleNuMatrix(p.dimensions[0],  p.dimensions[1], p.dimensions[2])
			)))
		});
		
		game.sponde.forEach(e => {
			e.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(VP, e.localMatrix))
		});
		
		space._resizeCanvas(gl);
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		game.drawSingleObject(game.bar);
		game.drawSingleObject(game.ball);
		twgl.drawObjectList(gl, game.block);
		twgl.drawObjectList(gl, game.powerup);
		twgl.drawObjectList(gl, game.sponde);
		requestAnimationFrame(game.play);
	}

	drawSingleObject(item) {
		gl.useProgram(item.programInfo.program);
		twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);
		twgl.setUniforms(item.programInfo, item.uniforms);
		twgl.drawBufferInfo(gl, item.bufferInfo);
	}

	willHavePowerUp() {
		return true;
		// randomically decides to add a powerup or not to the block: subsequent negative cases result in an increase 
		// of the pity, which increases the probability that the next block will have a powerup
		if (Math.random() + this.pity > 0.9) {
			this.pity = 0;
			return true;
		}

		else {
			this.pity += 0.1;
			return false;
		}
	}

	/* <----------------- Power-Up List -----------------> */
	
	POWERUPS = {
		"1": {
			"color": [1, 0.749019608, 0, 1],
			"effect":"Bigger bar",
			apply: function(){
				game.bar.dimensions[0] = 0.4
			},
			texture: {
				texture:setup.textures.enlarge,
				sampler:setup.samplers.nearest,
			}
		},
		"2": {
			"color": [0.501960784, 0, 1, 1],
			"effect":"Short bar",
			apply: function(){
				game.bar.dimensions[0] = 0.2
			},
			texture: {
				texture:setup.textures.restrict,
				sampler:setup.samplers.nearest,
			}
		},
		"3": {
			"color": [1, 0, 0.501960784, 1],
			"effect":"Speed up",
			apply: function(){
				game.velocityBall = 0.03
			}
		},
		"4": {
			"color": [0, 1, 0.749019608, 1],
			"effect":"slow down",
			apply: function(){
				game.velocityBall = 0.02
			}
		}
	};
	/* <----------------- Functions for UI -----------------> */

	updateScore() {
		this.score += 10;
		$(".ui-score").text("Score: " + this.score);

		//check win condition
		if (this.block.length === 0) {
			this.gameEnd = Date.now() / 1000;
			var gameDuration = this.gameEnd - this.gameStart;
			var finalScore = this.score + Math.round(2000 / gameDuration);
			game.changeState("Won");
			$("#victory-score").text("Your score: " + finalScore);
			document.getElementById('victory-screen').style.display = "block";
		}
	}

	handleLifeLoss() {
		console.log("lost a life or the game");
		game.changeState("Pause");
		game.powerup = []; //delete every rendered upgrade if the player loses a life
		this.lives -= 1;

		//handling cases where player still has 1-2 lives left
		if (this.lives + 1 === 3 || this.lives + 1 === 2) {
			const lifeId = this.lives + 1;
			document.getElementById('life-' + lifeId).style.display = "none";
			this.ballAngle = 90;
			this.bar.center = [0, -1];
			this.ball.center = [0.0, this.bar.center[1] + this.ball.radius + this.bar.dimensions[1]];
			this.arrow.updateLocal();
			console.log(this.ball.center,this.arrow.center);
			this.changeState("Starting");
			this.play();
		}

		//handling case where the player has no lives left: LOSS
		else if (this.lives + 1 === 1) {
			document.getElementById('life-1').style.display = "none";
			document.getElementById('lost-screen').style.display = "block";
		}
	}

}