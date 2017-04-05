function loadLevel() {
    clearLevel();

    let level = levels[currentLevelNum];
    if (level === undefined) {
        level = ['810,420','gravObj_flux,405,210, 0, 300000','wall,795,405','wall,765,405','wall,735,405','wall,735,375','wall,735,345', 'wall,765,345','wall,795,345', 'wall,795,375','exit,705,390', 'player,765,375'];
        let text = game.add.text(400, 170, "You're done!", {fill: "#000"});
        text.anchor.set(.5, .5);
        console.log("Attempted to load undefined level");
    }


    let bounds = level[0].split(',');
    game.world.setBounds(0,0,parseInt(bounds[0]), parseInt(bounds[1]));
    for (let i = 1; i < level.length; i++) {
        let element = level[i];
        let objectInfo = element.split(',');
        let objectName = objectInfo[0];
        let objectX = parseFloat(objectInfo[1]);
        let objectY = parseFloat(objectInfo[2]);
        loadObject(objectName, objectX, objectY);
    }

    addPlayer();
    addPlayerShadows();
}

function addPlayer() {
    player = game.add.sprite(player_startX, player_startY, 'player');
    player.anchor.set(.5, .5);
    player.body.setSize(14, 14, 1, 1);
    player.body.gravity.y = gravCoef / 60;
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER, .2);
}

function addPlayerShadows(){
    playerShadowLeft = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
    playerShadowLeft.anchor.set(.5, .5);
    playerShadowLeft.body.setSize(5, 1, 0, 8);

    playerShadowRight = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
    playerShadowRight.anchor.set(.5, .5);
    playerShadowRight.body.setSize(15, 1, 0, 8);

    playerShadowBottom = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
    playerShadowBottom.anchor.set(.5, .5);
    playerShadowBottom.body.setSize(15, 1, 0, 14);

    playerShadowTop = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
    playerShadowTop.anchor.set(.5, .5);
    playerShadowTop.body.setSize(13, 1, 0, 0);
}

function loadObject(objectName, objectX, objectY){
    switch(objectName) {
        case 'wall':
            let wall = game.add.sprite(objectX, objectY, objectName);
            walls.add(wall);
            wall.body.immovable = true;
            wall.anchor.set(.5,.5);
            break;
        case 'gravObj_off':
            // x Location, y location, gravMin, gravMax, on?, flux?, moving?
            initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), false, false, false);
            break;
        case 'gravObj_on':
            initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, false, false);
            break;
        case 'gravObj_flux':
            initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, true, false);
            break;
        case 'gravObj_move':
            //list in format x1#y1-x2#y2-x3#y3...
            let movementList = objectInfo[5].split('-');
            initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, false, true, movementList);
            break;
        case 'shocker':
            let shocker = game.add.sprite(objectX, objectY, objectName);
            shocker.anchor.set(.5, .5);
            shockers.add(shocker);
            shocker.animations.add('crackle');
            shocker.animations.play('crackle', 10, true);
            break;
        case 'exit':
            let exit = game.add.sprite(objectX, objectY, objectName);
            exit.anchor.set(.5, .5);
            exits.add(exit);
            exit.body.immovable = true;
            break;
        case 'player':
            player_startX = objectX;
            player_startY = objectY;
            break;
        default:
            break;
    }
}

function queueLevelsFromList(){
    let levelList = game.cache.getText('levelList').split('\n');
    levelCount = levelList.length;
    let levelNames = [levelCount];
    levels = [levelCount];
    for(let i=0; i<levelCount; i++){
        levelNames[i]="assets/levels/"+levelList[i];
        game.load.text("level"+i, levelNames[i]);
    }
}

function clearLevel(){
    walls.removeAll(true);
    shockers.removeAll(true);
    gravObjects.removeAll(true);
    exits.removeAll(true);

    // player is undefined on first run
    if (player !== undefined)
        player.kill();
    // exit is undefined on first run
    if (exit !== undefined)
        exit.kill();
}

function selectLevel(){
    currentLevelNum = $("#level-select").val();
    loadLevel();
}

function initializeGravObj(x, y, gravMin, gravMax, gravOn, flux, moving, movementList) {
    let gravObj = game.add.sprite(x, y, 'gravObj');
    gravObj.anchor.set(.5, .5);
    gravObj.gravOn = true ;
    gravObj.gravWeight = ((gravMin + gravMax)/2) * gravOn * (1 - flux);
    gravObj.gravMin = gravMin;
    gravObj.gravMax = gravMax;
    gravObjects.add(gravObj);
    gravObj.body.immovable = true;
    gravObj.inputEnabled = true;
    gravObj.flux = flux;
    gravObj.moving = moving;
    gravObj.movementList = movementList;
    gravObj.movementIndex = 0;
    if (! flux && ! moving) {
        gravObj.events.onInputDown.add(startGravityClick, this);
        gravObj.events.onInputUp.add(function() {
            clickedObj = null;
        }, this);
    } else if(flux) {
        gravObj.fluxConst = 1;
    }
    // TODO: make new grav obj sprite
    gravObj.tint = gravObjColor;
}
