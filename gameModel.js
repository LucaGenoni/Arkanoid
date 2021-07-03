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
  gl_Position = u_matrix * a_position;
}
`
fsBLOCK = `#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_colorText;

out vec4 outColor;

void main() {
	// vec4 color = 
   	outColor = texture(u_colorText, v_texcoord);
}
`;
class Arkanoid {
	constructor(params) {
		console.log("Preparing the game...");
		this.params = params;
		this.previousState = "Pause";
		this.state = "Starting";
		this.ballAngle = 90;

		this.score = 0;
		this.lives = 3;
		this.pity = 0;

		this.velocity = 0.02;
		this.velocityBar = 0.05;
		this.powerUpVelocity = 0.005;
		var path = window.location.pathname;
		var page = path.split("/").pop();
		var base = window.location.href.replace(page, '');
		
		const textures = twgl.createTextures(gl, {
			// a non-power of 2 image
			blocks: { src: base+"textures/prova.png" },
		});
		
		const sampler = twgl.createSamplers(gl, {
			nearest: {
				minMag: gl.NEAREST,
				maxMag: gl.NEAREST,
			},
		});
		// CREATE SHADERS

		this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);
		this.programInfoBLOCK = twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]);
		twgl.setAttributePrefix("a_");
		var colors = [[1, 0.250980392, 0, 1], [1, 0.501960784, 0, 1], [1, 0.749019608, 0, 1], [1, 1, 0, 1], [0.749019608, 1, 0, 1], [0.501960784, 1, 0, 1], [0.250980392, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0.250980392, 1], [0, 1, 0.501960784, 1], [0, 1, 0.749019608, 1], [0, 1, 1, 1], [0, 0.749019608, 1, 1], [0, 0.501960784, 1, 1], [0, 0.250980392, 1, 1], [0, 0, 1, 1], [0.250980392, 0, 1, 1], [0.501960784, 0, 1, 1], [0.749019608, 0, 1, 1], [1, 0, 1, 1], [1, 0, 0.749019608, 1], [1, 0, 0.501960784, 1], [1, 0, 0.250980392, 1], [1, 0, 0, 1],];

		// CREATE BAR

		var dimensions = [0.4, 0.1, 0.1];
		var barPosition = [0, -1];
		this.bar = {
			//uniforms like color, textures and other things
			typeObj: "Bar",
			center: [barPosition[0], barPosition[1], 0],
			dimensions: dimensions,
			uniforms: {
				u_color: [185 / 255, 122 / 255, 87 / 255, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_colorText:{
					texture: textures.blocks,
					sampler: sampler.nearest,
				},
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(barPosition[0], barPosition[1], 0),
					utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
				))
			},
			//shaders
			programInfo: this.programInfoBLOCK,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, cube()),
		};

		// CREATE EDGES

		this.sponde = [];
		for (x = 0; x < 3; x++) {
			var name;
			var signleColor = Math.floor(Math.random() * colors.length);
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
			this.sponde.push({
				//uniforms like color, textures and other things
				typeObj: name,
				center: coordinate,
				dimensions: dimensions,
				localMatrix: utils.multiplyMatrices(
					utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
					utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
				),
				uniforms: {
					u_color: colors[signleColor],
					// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
					u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
						utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
						utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
					))
				},
				//shaders
				programInfo: this.programInfo,
				//geometry
				bufferInfo: twgl.createBufferInfoFromArrays(gl, cube()),
			});
		}

		// CREATE BALL

		var radius = 0.1;
		var ballPosition = [0.0, barPosition[1] + radius + this.bar.dimensions[1]];
		this.ball = {
			//uniforms like color, textures and other things
			typeObj: "Ball",
			center: ballPosition,
			direction: [Math.cos(utils.degToRad(this.ballAngle)), Math.sin(utils.degToRad(this.ballAngle)), 0],
			radius: radius,
			uniforms: {
				u_color: [1, 1, 1, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(ballPosition[0], ballPosition[1], 0),
					utils.MakeScaleMatrix(radius)
				))
			},
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, buildGeometry(20, 20)),
		};

		// CREATE BLOCKS (AND INITIALIZE POWERUPS LIST)

		this.block = [];
		this.powerup = [];
		var coordinate;
		var power;
		var powerUpsCount = 0;
		for (var x = 0; x < map.length; x++) {
			for (var y = 0; y < map[x].length; y++) {
				var typeBlock = map[x][y];
				if (typeBlock != 0) { //to add different typeblock make more cases with 1,2,3 block
					var signleColor = Math.floor(Math.random() * colors.length);
					coordinate = [(2 * x - map.length + 1) / map.length, (2 * y - map[x].length + 1) / map[x].length, 0];
					dimensions = [1 / map.length, 1 / map[x].length, 0.1];
					
					power = false;
					if (this.willHavePowerUp()) {
						power = true;
						powerUpsCount += 1;
					}
					this.block.push({
						hasPowerUp: power,
						powerUpType: Math.floor(4* Math.random()) + 1, //identifies the upgrade (possible values: 1, 2, 3, 4),
						typeObj: "Block " + this.block.length,
						center: coordinate,
						dimensions: dimensions,
						localMatrix: utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
							utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
						),
						//uniforms like color, textures and other things
						uniforms: {
							u_color: colors[signleColor],
							u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
								utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
								utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
							))
						},
						//shaders
						programInfo: this.programInfo,
						//geometry
						bufferInfo: twgl.createBufferInfoFromArrays(gl, cube()),
					});
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
				if (this.state == "Starting") this.ball.center[0] = this.bar.center[0];
				this.updateSpigoliObject(this.bar);
				return;
			case "KeyD":
			case "ArrowRight":
				var tempChange = this.bar.center[0] + this.velocityBar;
				if (tempChange < 1 - this.bar.dimensions[0]) this.bar.center[0] = tempChange;
				else this.bar.center[0] = 1 - this.bar.dimensions[0];
				if (this.state == "Starting") this.ball.center[0] = this.bar.center[0];
				this.updateSpigoliObject(this.bar);
				return;
			// starting direction ball + counter-clockwise, - clockwise
			case "ArrowUp":
			case "KeyW":
				if (this.state == "Starting") this.ballAngle++;
				return;
			case "KeyS":
			case "ArrowDown":
				if (this.state == "Starting") this.ballAngle--;
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
				game.drawGame();
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
				game.ball.center[0] = game.ball.center[0] + game.ball.direction[0] * game.velocity;
				game.ball.center[1] = game.ball.center[1] + game.ball.direction[1] * game.velocity;
				
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
					console.log("lost a life or the game");
					game.changeState("Pause");
					game.powerup = []; //delete every rendered upgrade if the player loses a life
					game.handleLifeLoss();
					break;
				}
				// collisions with objects
				if (game.collision(game.bar) > 0) {
					if (game.bugRecovery) {
						console.log("FUCKING BUG");
						game.changeState("Pause");
						game.handleLifeLoss();
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
					
				game.drawGame();
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
				game.ball.center[0] = game.ball.center[0] - game.ball.direction[0] * game.velocity;
				game.ball.center[1] = game.ball.center[1] - game.ball.direction[1] * game.velocity;
				game.ball.direction =
					subVector(game.ball.direction,
						scalarVector(2 * dotProductVector(bounce, game.ball.direction) / dotProductVector(bounce, bounce),
							bounce));

				game.ball.center[0] = game.ball.center[0] + 2 * game.ball.direction[0] * game.velocity;
				game.ball.center[1] = game.ball.center[1] + 2 * game.ball.direction[1] * game.velocity;
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
		var dimX = shrk * dimensions[0];
		var dimY = shrk * dimensions[1];
		var dimZ = shrk * dimensions[2];
		
		this.powerup.push({
			powerUpType: powerUpType,
			center: blockCenter,
			dimensions: [dimX, dimY, dimZ],
			/*localMatrix: utils.multiplyMatrices(
				utils.MakeTranslateMatrix(blockCenter[0], blockCenter[1], 0),
				utils.MakeScaleNuMatrix(shrk * dimensions[0],  shrk * dimensions[1], shrk * dimensions[2])
			),*/
			//uniforms like color, textures and other things
			uniforms: {
				u_color: this.POWERUPS[powerUpType].color,
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(blockCenter[0], blockCenter[1], 0),
					utils.MakeScaleNuMatrix(dimX, dimY, dimZ)
				))
			},
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, cube()),
		})
	}
	
	drawGame() {

		var VP = utils.multiplyMatrices(space.getPerspective(), space.getView());
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
		"1": {"color": [1, 0.749019608, 0, 1]},
		"2": {"color": [0.501960784, 0, 1, 1]},
		"3": {"color": [1, 0, 0.501960784, 1]},
		"4": {"color": [0, 1, 0.749019608, 1]}
	};

	/* <----------------- Functions for UI -----------------> */

	updateScore() {
		//TODO: score modification to be changed considering the time spent playing, 
		// the active upgrade's score multiplier and whatever else we feel is needed

		this.score += 10;
		$(".ui-score").text("Score: " + this.score);

		//check win condition
		if (this.block.length === 0) {
			game.changeState("Won");
			$("#victory-score").text("Your score: " + this.score);
			document.getElementById('victory-screen').style.display = "block";
		}
	}

	handleLifeLoss() {
		this.lives -= 1;

		//handling cases where player still has 1-2 lives left
		if (this.lives + 1 === 3 || this.lives + 1 === 2) {
			const lifeId = this.lives + 1;
			document.getElementById('life-' + lifeId).style.display = "none";
			this.ballAngle = 90;
			this.ball.center = [0.0, -0.8];
			this.bar.center = [0, -1];
			game.changeState("Starting");
			this.play();
		}

		//handling case where the player has no lives left: LOSS
		else if (this.lives + 1 === 1) {
			document.getElementById('life-1').style.display = "none";
			this.changeState("Pause");
			document.getElementById('lost-screen').style.display = "block";
		}
	}

}