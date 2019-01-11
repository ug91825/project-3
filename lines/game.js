// Global variables

var ballbox_o;
var ballbox;

var debugbox;

var curtime;

var balls = new Array(9);

function randint(a, b){
	return Math.floor(a + (Math.random() * (b-a+1)))
}

function decround(a, pl){
	return Math.round(a * Math.pow(10, pl)) / Math.pow(10, pl);
}

// Loading code; this is what starts everything

function load_everything(){

	debugbox = document.getElementById("debugbox");

	ballbox_o = document.getElementById("ballbox");
	ballbox = ballbox_o.getContext("2d");

	ballbox_o.onclick = function(e) {

		if(e.hasOwnProperty('offsetX')){
			var x = e.offsetX;
			var y = e.offsetY;
		}else{
			var x = e.layerX;
			var y = e.layerY;
		}

		select_square(Math.floor(x / squaresize), Math.floor(y / squaresize));

	};

	for(a = 0; a < 9; ++a){
		balls[a] = new Image();
	}
	
	balls[0].src = "ball-null.png";
	balls[1].src = "ball-red.png";
	balls[2].src = "ball-orange.png";
	balls[3].src = "ball-yellow.png";
	balls[4].src = "ball-green.png";
	balls[5].src = "ball-cyan.png";
	balls[6].src = "ball-blue.png";
	balls[7].src = "ball-purple.png";
	balls[8].src = "ball-magenta.png";
	
	var thedate = new Date();
	curtime = thedate.getTime();

	setInterval(updateF, 1);

}

// Game State.

var score = 0;
var plus_score = 0;

var animationstate = -1;
// 0 = accepts input
// 1 = is animating a ball
// 2 = spawning
// 3 = despawning

// -1 = title screen

var nextspawn = [];
var despawn = [];
var moveball = -1;

// Interface tweaking

var spawn_secs = 0.2;	// default value: 0.2
var move_secs = 0.08;	// default value: 0.08
var jerkiness = 0.75;	// default value: 0.75
var bounce_secs = 0.5; 	// default value: 0.5

var gridsize = 9;

var squaresize = 360 / gridsize;
var ballsize = squaresize * 0.8;

var min_bounce_size = ballsize * 0.875;
var max_bounce_size = ballsize * 1.125;

// Game settings

var colours = 7;
var init_init_nexttimer = 15;
var timdecratio = 0.996;


var ballgrid = new Array(gridsize);
for(a = 0; a < gridsize; ++a){
	ballgrid[a] = new Array(gridsize);
	for(b = 0; b < gridsize; ++b){
		ballgrid[a][b] = 0;
	}
}

var gamemode = 2;
// 1 = classic
// 2 = timed

// Timers
var init_nexttimer = 15;
var nexttimer = 0;

var anisecs = 0;
var cyclesecs = 0;

var game_over = false;


function board_is_full(){
	for(a = 0; a < gridsize; ++a){
		for(b = 0; b < gridsize; ++b){
			if (ballgrid[a][b] == 0) return false;
		}
	}
	return true;
}

function is_spawning(a, b){
	for(m = 0; m < nextspawn.length; ++m)
		if (nextspawn[m] == a*gridsize+b) return true;
	return false;
}

function is_despawning(a, b){
	for(m = 0; m < despawn.length; ++m)
		if (despawn[m] == a*gridsize+b) return true;
	return false;
}


var nextballs = [0, 0, 0];

function update_next(){
	for(m = 0; m < 3; ++m){
		nextballs[m] = randint(1,colours);
	}
	document.getElementById("nextball1").src = balls[nextballs[0]].src;
	document.getElementById("nextball2").src = balls[nextballs[1]].src;
	document.getElementById("nextball3").src = balls[nextballs[2]].src;
}

function spawn_new_balls(spawnlist){

	if(game_over || board_is_full()) return; // can't spawn new balls on a full board

	nextspawn = []; // reset the spawn list

	animationstate = 2;
	anisecs = spawn_secs; // set the animation mode.

	for(n = 0; n < spawnlist.length; ++n){

		if(game_over || board_is_full()){
			game_over = true;
			return; // game over
		}

		// replace this with the original, more efficient code eventually.
		nextspawn[n] = randint(0, (gridsize * gridsize - 1));
		while(ballgrid[Math.floor(nextspawn[n]/gridsize)][nextspawn[n]%gridsize] != 0){
			nextspawn[n] = randint(0, (gridsize * gridsize - 1));
		}
		ballgrid[Math.floor(nextspawn[n]/gridsize)][nextspawn[n]%gridsize] = spawnlist[n];

	}

	if(game_over){
		// create a dialog of some sort
	}

}

function check(){

	despawn = [];

	// returns true if five were found in a row.
	// vertical
	for(a = 0; a < gridsize; ++a){	
		for(b = 0; b < gridsize - 4; ++b){
			if(	ballgrid[a][b] == ballgrid[a][b+1] &&
				ballgrid[a][b] == ballgrid[a][b+2] &&
				ballgrid[a][b] == ballgrid[a][b+3] &&
				ballgrid[a][b] == ballgrid[a][b+4] &&
				ballgrid[a][b] != 0
			){
				despawn.push(a*gridsize+b);
				despawn.push(a*gridsize+b+1);
				despawn.push(a*gridsize+b+2);
				despawn.push(a*gridsize+b+3);
				despawn.push(a*gridsize+b+4);
			}
		}
	}
	// horizontal
	for(a = 0; a < gridsize - 4; ++a){	
		for(b = 0; b < gridsize; ++b){
			if(	ballgrid[a][b] == ballgrid[a+1][b] &&
				ballgrid[a][b] == ballgrid[a+2][b] &&
				ballgrid[a][b] == ballgrid[a+3][b] &&
				ballgrid[a][b] == ballgrid[a+4][b] &&
				ballgrid[a][b] != 0
			){
				despawn.push(a*gridsize+b);
				despawn.push(a*gridsize+b+gridsize);
				despawn.push(a*gridsize+b+gridsize*2);
				despawn.push(a*gridsize+b+gridsize*3);
				despawn.push(a*gridsize+b+gridsize*4);
			}
		}
	}
	// diagonal
	for(a = 0; a < gridsize - 4; ++a){	
		for(b = 0; b < gridsize - 4; ++b){
			if(	ballgrid[a][b] == ballgrid[a+1][b+1] &&
				ballgrid[a][b] == ballgrid[a+2][b+2] &&
				ballgrid[a][b] == ballgrid[a+3][b+3] &&
				ballgrid[a][b] == ballgrid[a+4][b+4] &&
				ballgrid[a][b] != 0
			){
				despawn.push(a*gridsize+b);
				despawn.push(a*gridsize+b+gridsize+1);
				despawn.push(a*gridsize+b+gridsize*2+2);
				despawn.push(a*gridsize+b+gridsize*3+3);
				despawn.push(a*gridsize+b+gridsize*4+4);
			}
			if(	ballgrid[a+4][b] == ballgrid[a+3][b+1] &&
				ballgrid[a+4][b] == ballgrid[a+2][b+2] &&
				ballgrid[a+4][b] == ballgrid[a+1][b+3] &&
				ballgrid[a+4][b] == ballgrid[a][b+4] &&
				ballgrid[a+4][b] != 0
			){
				despawn.push(a*gridsize+b+4);
				despawn.push(a*gridsize+b+gridsize+3);
				despawn.push(a*gridsize+b+gridsize*2+2);
				despawn.push(a*gridsize+b+gridsize*3+1);
				despawn.push(a*gridsize+b+gridsize*4);
			}
		}
	}
	// then, remove duplicates.
	for(a = 0; a < despawn.length; ++a){
		for(b = a + 1; b < despawn.length;){
			if(despawn[a] == despawn[b]){
				despawn.splice(b, 1);
			}else ++b;
		}
	}
	return despawn.length > 0;
}

function path_exists(src_x, src_y, dest_x, dest_y){
	
	if (ballgrid[src_x][src_y] == 0) return false;
	
	var is_reachable = new Array(gridsize + 2);
	for(a = 0; a < gridsize + 2; ++a){
		is_reachable[a] = new Array(gridsize + 2);
		for(b = 0; b < gridsize + 2; ++b){
			is_reachable[a][b] = false;
		}
	}

	// obviously a ball can reach its own square.
	is_reachable[src_x + 1][src_y + 1] = true;

	// floodfill
	var filled = false;
	while(!filled){
		filled = true;
		for(a = 1; a <= gridsize; ++a){
			for(b = 1; b <= gridsize; ++b){
				if((is_reachable[a-1][b] ||
					is_reachable[a+1][b] ||
					is_reachable[a][b-1] ||
					is_reachable[a][b+1]) &&
					!is_reachable[a][b] &&
					ballgrid[a-1][b-1] == 0){
					is_reachable[a][b] = true;
					filled = false;
				}
			}
		}
	}

	return is_reachable[dest_x + 1][dest_y + 1];

}

function shortest_path(src_x, src_y, dest_x, dest_y){
	
	// this code assumes a path exists.

	var path = [];

	// We use arrays of 11 so that we don't need to consider those icky edge cases.
	var lastpath = new Array(gridsize+2);
	var lastpath2 = new Array(gridsize+2);
	for(a = 0; a < gridsize+2; ++a){
		lastpath[a] = new Array(gridsize+2);
		lastpath2[a] = new Array(gridsize+2);
		for(b = 0; b < gridsize+2; ++b){
			lastpath[a][b] = -1;
			lastpath2[a][b] = -1;
		}
	}

	lastpath[src_x + 1][src_y + 1] = src_x * gridsize + src_y;
	lastpath2[src_x + 1][src_y + 1] = src_x * gridsize + src_y;

	// it's the floodfill again!
	var filled = false;
	while(!filled){
		filled = true;
		for(a = 0; a < gridsize; ++a){
			for(b = 0; b < gridsize; ++b){
				if(lastpath[a+1][b+1] == -1 && ballgrid[a][b] == 0){
					
					// mark down the closest square that's connected
					if (lastpath[a][b+1] != -1) {lastpath2[a+1][b+1] = (a-1) * gridsize + b; filled = false;}
					if (lastpath[a+2][b+1] != -1) {lastpath2[a+1][b+1] = (a+1) * gridsize + b; filled = false;}
					if (lastpath[a+1][b] != -1) {lastpath2[a+1][b+1] = (a) * gridsize + b-1; filled = false;}
					if (lastpath[a+1][b+2] != -1) {lastpath2[a+1][b+1] = (a) * gridsize + b+1; filled = false;}

				}
			}
		}

		for(a = 0; a < gridsize; ++a){
			for(b = 0; b < gridsize; ++b){
				lastpath[a+1][b+1] = lastpath2[a+1][b+1];
			}
		}
	}

	var cursqr = dest_x * gridsize + dest_y;
	if(lastpath[Math.floor(cursqr/gridsize) + 1][cursqr % gridsize + 1] == -1){
		debugbox.innerHTML += "No path found.";
		return path; // a path doesn't exist.
	}
	
	path[0] = cursqr;
	// debugbox.innerHTML = "";

	// trace the path back to its origin
	while(lastpath[Math.floor(cursqr/gridsize) + 1][cursqr % gridsize + 1] != cursqr){
		cursqr = lastpath[Math.floor(cursqr/gridsize)+1][cursqr%gridsize+1];
		// debugbox.innerHTML += "" + cursqr + " ";
		path.push(cursqr);
	}

	return path;

}

function reset_board(){

	hide_gameover();
	hide_titlescreen();

	for(a = 0; a < gridsize; ++a){
		for(b = 0; b < gridsize; ++b){
			ballgrid[a][b] = 0;
		}
	}
	score = 0;
		document.getElementById("scoredisp").innerHTML = score;
	movedsquares = 0;
	plus_score = 0;
	game_over = false;
	anipath = [];
	moveball = -1;
	
	initspawn = [];
	for(a = 0; a < 5; ++a) initspawn[a] = randint(1,colours);
	spawn_new_balls(initspawn);

// for timed mode only
	init_nexttimer = init_init_nexttimer;

}

moveball_x = -1;
moveball_y = -1;

movedsquares = 0;

// Input handler.

selection_x = -1;
selection_y = -1;

function select_square(a, b){
	if(animationstate != 0) return; // only allow input in that case.

	if(selection_x == -1 && selection_y == -1 || ballgrid[a][b] != 0){
		selection_x = a;
		selection_y = b;
		cyclesecs = move_secs / 3;
	}else{
		// try to find a path
		var path = path_exists(selection_x, selection_y, a, b);
		if(path){
			// find the path and move the ball there.
			// debugbox.innerHTML = "A path exists from (" + selection_x + "," + selection_y + ") to (" + a + "," + b + ")";
			anipath = shortest_path(selection_x, selection_y, a, b);

			ballgrid[a][b] = ballgrid[selection_x][selection_y];
			ballgrid[selection_x][selection_y] = 0;
			
			moveball = a*gridsize+b;

			animationstate = 1;
			selection_x = -1;
			selection_y = -1;
		}else{
			// debugbox.innerHTML = "A path does not exist from (" + selection_x + "," + selection_y + ") to (" + a + "," + b + ")";
		}
	}

}


function update_gamestate(delta_time){

	if(animationstate == 1){

		anisecs += delta_time;

		if (Math.floor(anisecs / move_secs) > movedsquares){
			plus_score += Math.floor(anisecs / move_secs) - movedsquares; // add 1 point for each square moved.
			movedsquares = Math.floor(anisecs / move_secs);
		}

		if(anisecs >= move_secs * (anipath.length - 1)){
			moveball = -1;
			moveball_x = -1;
			moveball_y = -1;
			animationstate = 0;
			anisecs = 0;
			movedsquares = 0;
			if(check()){
				animationstate = 3;
				anisecs = spawn_secs;
				plus_score += 100 + 20 * (despawn.length - 5) * (despawn.length - 5);
			}else{
				spawn_new_balls(nextballs);
			}
		}

		// debugbox.innerHTML = plus_score;

		var curball = anipath.length - Math.floor(anisecs / move_secs) - 1;
		var pos1 = anipath[curball];
		var pos2 = anipath[curball - 1];
		var complet_fraction = (anisecs - Math.floor(anisecs / move_secs) * move_secs) / move_secs;
		complet_fraction = (jerkiness == 1) ? 0 : Math.max(0, 1 - (1 - complet_fraction) / (1 - jerkiness));

		moveball_x = (Math.floor(pos1 / gridsize) * squaresize + squaresize/10) * (1 - complet_fraction) + (Math.floor(pos2 / gridsize) * squaresize + squaresize/10) * (complet_fraction);
		moveball_y = ((pos1 % gridsize) * squaresize + squaresize/10) * (1 - complet_fraction) + ((pos2 % gridsize) * squaresize + squaresize/10) * (complet_fraction);

	}else if(animationstate == 2){
		// spawning balls
		anisecs -= delta_time;
		if (anisecs <= 0){

			anisecs = 0;
			animationstate = 0;
			update_next();
			if(check()){
				animationstate = 3;
				anisecs = spawn_secs;
				plus_score += 100 + 20 * (despawn.length - 5) * (despawn.length - 5);
			}
			if(board_is_full()){
				// game over!
				animationstate = -1;
				show_gameover();
			}

			// for timed mode only
			nexttimer = init_nexttimer;
			init_nexttimer *= timdecratio;

		}

	}else if(animationstate == 3){
		// despawning balls
		anisecs -= delta_time;
		if (anisecs <= 0){
			anisecs = 0;
			animationstate = 0;
			// clear the despawned balls
			for(a = 0; a < despawn.length; ++a){
				ballgrid[Math.floor(despawn[a] / gridsize)][despawn[a] % gridsize] = 0;
			}

			// for timed mode only
			nexttimer = init_nexttimer;
		}

	}else if(animationstate == 0){
		nexttimer -= delta_time;
		cyclesecs += delta_time;
		if (nexttimer <= 0){
			// if the timer runs out, get some new balls
			spawn_new_balls(nextballs);
		}
		if(cyclesecs >= bounce_secs){
			cyclesecs -= bounce_secs;
		}
	}

}

// Rendering code.

function redraw(){

// update all the information from the game state.

	ballbox.clearRect(0, 0, 360, 360);

	for(a = 0; a < gridsize; ++a){
		for(b = 0; b < gridsize; ++b){
			ballbox.fillStyle="#f0f0f0";
			ballbox.fillRect(squaresize*a+1, squaresize*b+1, squaresize-2, squaresize-2);
		}
	}

	for(a = 0; a < gridsize; ++a){
		for(b = 0; b < gridsize; ++b){
			if(animationstate == 2 && is_spawning(a,b)){
				ballbox.drawImage(balls[ballgrid[a][b]],
					squaresize * a + squaresize/10 + (anisecs / spawn_secs) * ballsize/2,
					squaresize * b + squaresize/10 + (anisecs / spawn_secs) * ballsize/2,
					ballsize - (anisecs / spawn_secs) * ballsize,
					ballsize - (anisecs / spawn_secs) * ballsize
				);
			}else if(animationstate == 3 && is_despawning(a,b)){
				ballbox.drawImage(balls[ballgrid[a][b]],
					squaresize * a + squaresize/2 - (anisecs / spawn_secs) * ballsize/2,
					squaresize * b + squaresize/2 - (anisecs / spawn_secs) * ballsize/2,
					(anisecs / spawn_secs) * ballsize,
					(anisecs / spawn_secs) * ballsize
				);
			}else if(animationstate == 1 && moveball == a*gridsize+b){
				ballbox.drawImage(balls[ballgrid[a][b]], moveball_x, moveball_y, ballsize, ballsize);
			}else if(selection_x == a && selection_y == b){
				// bouncefunc is a function : [0,1) -> [0,1) that determines the "bounce coefficient".

				var phase = (cyclesecs / bounce_secs); // from 0 to 1
				// var bouncefunc = Math.abs(Math.sin(phase * Math.PI));
				var bouncefunc = (-4 * phase * phase + 4 * phase);

				var bounceballsize = bouncefunc * (max_bounce_size - min_bounce_size) + min_bounce_size;
				ballbox.drawImage(balls[ballgrid[a][b]],
					squaresize * a + squaresize/2 - (bounceballsize / 2),
					squaresize * b + squaresize/2 - (bounceballsize / 2),
					bounceballsize, bounceballsize);
			}else{
				ballbox.drawImage(balls[ballgrid[a][b]], squaresize*a+squaresize/10, squaresize*b+squaresize/10, ballsize, ballsize);
			}
		}
	}

	// for timed mode only

	document.getElementById("timerbar").getContext("2d").clearRect(0, 0, 100, 1);
	document.getElementById("timerbar").getContext("2d").fillRect(0, 0, 100 * nexttimer / init_nexttimer, 1);

	// debugbox.innerHTML = nexttimer.toFixed(3);
	
	if(plus_score > 0){
		var scorevel = Math.max(1, Math.floor(plus_score * 0.2));
		score += scorevel;
		plus_score -= scorevel;
		document.getElementById("scoredisp").innerHTML = score;
	}

}


// Main update loop

function updateF(){
	var thedate = new Date();
	delta_ms = thedate.getTime() - curtime;
	curtime = thedate.getTime();

	update_gamestate(delta_ms / 1000.0);
	redraw();
}



// Dialogs

var prev_animstate = -1;

function open_help(){
	document.getElementById("helpbox").style['display'] = "block";
	prev_animstate = animationstate;
	animationstate = -1;
}

function close_help(){
	document.getElementById("helpbox").style['display'] = "none";
	animationstate = prev_animstate;
}


function open_about(){
	document.getElementById("aboutbox").style['display'] = "block";
	prev_animstate = animationstate;
	animationstate = -1;
}

function close_about(){
	document.getElementById("aboutbox").style['display'] = "none";
	animationstate = prev_animstate;
}


function open_settings(){
	document.getElementById("settingbox").style['display'] = "block";
	prev_animstate = animationstate;
	animationstate = -1;
}

function close_settings(){
	document.getElementById("settingbox").style['display'] = "none";
	animationstate = prev_animstate;
}


function show_gameover(){
	document.getElementById("gameoverbox").style['display'] = "block";
}

function hide_gameover(){
	document.getElementById("gameoverbox").style['display'] = "none";
}

function hide_titlescreen(){
	document.getElementById("titlebox").style['display'] = "none";
}
