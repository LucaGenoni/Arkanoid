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
		this.ballAngle = 90;
		this.ballPosition = [0.0,-0.8];
		this.barPosition = [0,-1];
		this.score = 0;
		this.velocity = 0.02
		this.velocityBar = 0.02
		this.isGameStopped = true;
		document.onkeydown = (keyDownEvent) => this.keyDown(keyDownEvent);
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
		
		this.bar = {
			//uniforms like color, textures and other things
			
			center:[this.barPosition[0],this.barPosition[1],0],
			dimensions: [0.2,0.1,0.1],
			uniforms: { 
				u_color: [185/255, 122/255, 87/255, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(this.barPosition[0],this.barPosition[1],0),
					utils.MakeScaleNuMatrix(0.2,0.1,0.1)
				))
			},	
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
		}

		this.ball = {
			//uniforms like color, textures and other things
			direction:[Math.cos(utils.degToRad(this.ballAngle)),Math.sin(utils.degToRad(this.ballAngle)),0],
			radius:0.1,
			uniforms: { 
				u_color: [1, 1, 1, 1],
				// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(this.ballPosition[0],this.ballPosition[1],0),
					utils.MakeScaleNuMatrix(0.1,0.1,0.1)
				))
			},	
			//shaders
			programInfo: this.programInfo,
			//geometry
			bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
		}

		this.block = [];
		// loading meshes blocks
		for (x=0;x<map.length;x++){
			for (y=0;y<map[x].length;y++){
				var typeBlock = map[x][y];
				if (typeBlock != 0){					
					var signleColor = Math.floor(Math.random() * colors.length);
					console.log((2*x-map.length+1)/map.length,(2*y-map[x].length+1)/map[x].length);
					var coordinate = [(2*x-map.length+1)/map.length,(2*y-map[x].length+1)/map[x].length,0];
					var scaling = 0.1;
					this.block.push({
						//uniforms like color, textures and other things
						center:coordinate,
						dimensions: [scaling,scaling,scaling],
						uniforms: {
							u_color: colors[signleColor],
							// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
							u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
								utils.MakeTranslateMatrix(coordinate[0],coordinate[1],0),
								utils.MakeScaleMatrix(0.1)
							))
						},
						//shaders
						programInfo: this.programInfo,
						//geometry
						bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
					});
				}
				// else{
				// 	this.block.push({
				// 		//uniforms like color, textures and other things
				// 		uniforms: { 
				// 			u_color: [0,0,0,1],
				// 			// u_matrix: utils.MakeTranslateMatrix((2*x-map.length)/map.length,(2*y-map[x].length)/map[x].length,0)
				// 			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				// 				utils.MakeTranslateMatrix((2*x-map.length+1)/map.length,(2*y-map[x].length+1)/map[x].length,0),
				// 				utils.MakeScaleMatrix(0.1)
				// 			))
				// 		},	
				// 		//shaders
				// 		programInfo: this.programInfo,
				// 		//geometry
				// 		bufferInfo: twgl.createBufferInfoFromArrays(gl, this.geometryBlock),
				// 	})
				// }
			}
		}


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
						this.barPosition[0]-=this.velocityBar;
						this.ballPosition[0]-=this.velocityBar;
						break;
					// starting position bar to left
					case "KeyD":
					case "ArrowRight":
						this.barPosition[0]+=this.velocityBar;
						this.ballPosition[0]+=this.velocityBar;
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
						this.barPosition[0]-=this.velocityBar;
						break;
					// position bar
					case "KeyD":
					case "ArrowRight":
						this.barPosition[0]+=this.velocityBar;
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
				
				game.ballPosition[0] = game.ballPosition[0]; 
				game.ballPosition[1] = game.ballPosition[1];
				
				game.ball.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(game.ballPosition[0],game.ballPosition[1],0),
					utils.MakeScaleNuMatrix(0.1,0.1,0.1)
				))
				
				game.bar.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(game.barPosition[0],game.barPosition[1],0),
					utils.MakeScaleNuMatrix(0.2,0.1,0.1)
				))
				twgl.resizeCanvasToDisplaySize(gl.canvas);
				gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			
				game.drawSingleObject(game.bar);
				game.drawSingleObject(game.ball);
				twgl.drawObjectList(gl, game.block);
			
				requestAnimationFrame(game.render);
				break;     
			case "Playing":
				console.log(game.state,game.ballPosition,game.ballAngle,game.barPosition);
				// rendering
				// scene.updateWorldMatrices();	
				// var viewProj = m4.multiply(proj,view)
				// this.nodeObjects.forEach(e => {
				// 	e.drawInfo.uniforms.u_matrix = m4.multiply(viewProj, e.worldMatrix)
				// 	//extention for detection
				// 		if(e.drawDetectionID) {
				// 			e.drawDetectionID.uniforms.u_matrix = e.drawInfo.uniforms.u_matrix
				// 			e.drawDetectionColor.uniforms.u_matrix = e.drawInfo.uniforms.u_matrix					
				// 		}
				// });
				
				game.ballPosition[0] = game.ballPosition[0] + game.ball.direction[0]*game.velocity;
				game.ballPosition[1] = game.ballPosition[1] + game.ball.direction[1]*game.velocity;

				// check collisioni con sponde
					if(Math.abs(game.ballPosition[0])>1-game.ball.radius) game.ball.direction[0] = -game.ball.direction[0];
					if(game.ballPosition[1]>1-game.ball.radius) game.ball.direction[1] = -game.ball.direction[1];
					if(game.ballPosition[1]<-1+game.ball.radius) {
						console.log("lost a life or the game");
						game.state = "Pause";
						break;
					}
				// check collisioni con barra
				var xaxis = Math.abs(game.ballPosition[0] - game.barPosition[0]) - game.bar.dimensions[0];
				var yaxis = Math.abs(game.ballPosition[1] - game.barPosition[1]) - game.bar.dimensions[1];
				
				if(xaxis<=0 && yaxis<game.ball.radius){
					// collision on xaxis
					console.log("collision detected on yaxis bar");
					game.ball.direction[1] = -game.ball.direction[1];
					game.ballPosition[1] = game.ballPosition[1] + game.ball.direction[1]*game.velocity;

				}else if(yaxis<0 && xaxis<game.ball.radius){
					// collision on yaxis
					console.log("collision detected on xaxis bar");
					game.ball.direction[0] = -game.ball.direction[0];
					game.ballPosition[0] = game.ballPosition[0] + game.ball.direction[0]*game.velocity;
					
				}else if(xaxis<game.ball.radius &&yaxis<game.ball.radius){
					// possible collision on the edge 
					var spigoli =[
						[(game.barPosition[0] + game.bar.dimensions[0]),(game.barPosition[1] + game.bar.dimensions[1]),0],
						[(game.barPosition[0] + game.bar.dimensions[0]),(game.barPosition[1] - game.bar.dimensions[1]),0],
						[(game.barPosition[0] - game.bar.dimensions[0]),(game.barPosition[1] + game.bar.dimensions[1]),0],
						[(game.barPosition[0] - game.bar.dimensions[0]),(game.barPosition[1] - game.bar.dimensions[1]),0]
					]
					for(var j=0;j< spigoli.length;j++){
						xaxis = game.ballPosition[0] - spigoli[j][0];
						yaxis = game.ballPosition[1] - spigoli[j][1];
						// pitagora
						if((xaxis**2 + yaxis**2 - game.ball.radius**2)<0){
							console.log("collision detected on spigolo bar");
							game.ball.direction[0] = -game.ball.direction[0];
							game.ball.direction[1] = -game.ball.direction[1];
							
							game.ballPosition[0] = game.ballPosition[0] + game.ball.direction[0]*game.velocity;
							game.ballPosition[1] = game.ballPosition[1] + game.ball.direction[1]*game.velocity;
						};
					}
				}
				// collision with blocks
				for (let i = 0; i < game.block.length; i++) {
					const e = game.block[i];					
					var xaxis = Math.abs(game.ballPosition[0] - e.center[0]) - e.dimensions[0];
					var yaxis = Math.abs(game.ballPosition[1] - e.center[1]) - e.dimensions[1];
					if(xaxis<=0 && yaxis<game.ball.radius){
						// collision on xaxis
						console.log("collision detected on yaxis",i);
						game.ball.direction[1] = -game.ball.direction[1];
						game.ballPosition[1] = game.ballPosition[1] + game.ball.direction[1]*game.velocity;
						//delete the block that was hit and update the player's score
						game.block.splice(i, 1);
						game.updateScore();

					}else if(yaxis<0 && xaxis<game.ball.radius){
						// collision on yaxis
						console.log("collision detected on xaxis",i);
						game.ball.direction[0] = -game.ball.direction[0];
						game.ballPosition[0] = game.ballPosition[0] + game.ball.direction[0]*game.velocity;
						//delete the block that was hit and update the player's score
						game.block.splice(i, 1);
						game.updateScore();
						
					}else if(xaxis<game.ball.radius &&yaxis<game.ball.radius){
						// possible collision on the edge 
						var spigoli =[
							[(e.center[0] + e.dimensions[0]),(e.center[1] + e.dimensions[1]),0],
							[(e.center[0] + e.dimensions[0]),(e.center[1] - e.dimensions[1]),0],
							[(e.center[0] - e.dimensions[0]),(e.center[1] + e.dimensions[1]),0],
							[(e.center[0] - e.dimensions[0]),(e.center[1] - e.dimensions[1]),0]
						]
						for(var j=0;j< spigoli.length;j++){
							xaxis = game.ballPosition[0] - spigoli[j][0];
							yaxis = game.ballPosition[1] - spigoli[j][1];
							// pitagora
							if((xaxis**2 + yaxis**2 - game.ball.radius**2)<0){
								console.log("collision detected with block ",j);
								game.ball.direction[0] = -game.ball.direction[0];
								game.ball.direction[1] = -game.ball.direction[1];
								
								game.ballPosition[0] = game.ballPosition[0] + game.ball.direction[0]*game.velocity;
								game.ballPosition[1] = game.ballPosition[1] + game.ball.direction[1]*game.velocity;
								//delete the block that was hit and update the player's score
								game.block.splice(i, 1);
								game.updateScore();
								break;
							};
						}
					}
				}
				game.ball.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(game.ballPosition[0],game.ballPosition[1],0),
					utils.MakeScaleNuMatrix(0.1,0.1,0.1)
				))
				
				game.bar.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
					utils.MakeTranslateMatrix(game.barPosition[0],game.barPosition[1],0),
					utils.MakeScaleNuMatrix(0.2,0.1,0.1)
				))
				
				twgl.resizeCanvasToDisplaySize(gl.canvas);
				gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			
				game.drawSingleObject(game.bar);
				game.drawSingleObject(game.ball);
				twgl.drawObjectList(gl, game.block);
			
				requestAnimationFrame(game.render);
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

	updateScore(){
		//TODO: score modification to be changed considering the time spent playing, 
		// the active upgrade's score multiplier and whatever else we feel is needed
		
		this.score+=10;
		$(".ui-score").text("Score: " + this.score);
	}
	
	// drawScene() {
	// 	//this function must work with globals   
	// 	switch (game.state) {
	// 		case "Starting":
	// 		case "Playing":
	// 			console.log(game.state,game.ballPosition,game.ballAngle,game.barPosition)
	// 			// rendering
	// 			// scene.updateWorldMatrices();	
	// 			// var viewProj = m4.multiply(proj,view)
	// 			// this.nodeObjects.forEach(e => {
	// 			// 	e.drawInfo.uniforms.u_matrix = m4.multiply(viewProj, e.worldMatrix)
	// 			// 	//extention for detection
	// 			// 		if(e.drawDetectionID) {
	// 			// 			e.drawDetectionID.uniforms.u_matrix = e.drawInfo.uniforms.u_matrix
	// 			// 			e.drawDetectionColor.uniforms.u_matrix = e.drawInfo.uniforms.u_matrix					
	// 			// 		}
	// 			// });
	// 			twgl.drawObjectList(gl, game.block);
	// 			requestAnimationFrame(game.drawScene);
	// 			break;                    
	// 		default:
	// 			console.log("Block refresh");
	// 			break;
	// 	}
	// }
}