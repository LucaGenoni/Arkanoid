class powerUp {
    constructor(game, id){
        this.arkanoidGame = game;
        this.id = id;
        this.type = Math.floor(4* Math.random()) + 1; //identifies the upgrade (possible values: 1, 2, 3, 4)
    }

    getType(){
        return this.type;
    }
}