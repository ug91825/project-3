///////////////////////
// Class definitions
///////////////////////

function block(colour){
	
	// init
	
	// Block states
	// 0: Sitting
	// 1: Flashing
	// 2: Disappearing
	// 3: Falling
	this.blockstate = 0;

	this.colour = colour; // 1 to 6; 0 is empty

	this.flashtime = 0; // number of seconds before current block stops flashing
	this.disappeartime = 0; // number of seconds before current block disappears
	this.removetime = 0; // number of seconds before current block is removed
	this.falltime = 0; // number of seconds before current block falls

	// Determine the combo number of the block.
	this.combo = 0;
	this.comboblocks = 0;
	
	return this;

}



///////////////////////////
// MAIN CODE
///////////////////////////

// Settings

var init_flashtime = 54;
var init_disappeartime = 90;
var perblock_disappeartime = 18;
var init_falltime = 18;

var switch_falltime = 15;

var game_mode = "normal";

var paused = false;

// Global variables

var curtime = new Date().getTime();

// six colours of block, and a null colour.
var blocks = new Array(7);

// The block grid is 13 x 6 (12 x 6 with an extra row for edge bleeding).
blockgrid = new Array(13);
for(var a = 0; a < 13; ++a){
	blockgrid[a] = new Array(6);
	for(var b = 0; b < 6; ++b){
		blockgrid[a][b] = new block(0);
	}
}

var blockbox, blockbox_o;
var debugbox;

var blocksize = 45;

function randint(a, b){
	return Math.floor(a + (Math.random() * (b-a+1)))
}

// Loading code; this is what starts everything

function load_everything(){

	debugbox = document.getElementById("debugbox");

	blockbox_o = document.getElementById("blockbox");
	blockbox = blockbox_o.getContext("2d");

	window.addEventListener("keydown", process_input, true);
	window.addEventListener("keyup", release_key, true);
	setInterval(updateF, 1);


}

var ai = false;

var advance = false;

var colours = 6;
var adv_speed = 0.05;

var start_level = 1;
var time_level = 1;
var block_level = 1;
var speed_level = 1;

var total_blocks = 0;

var elapsed_time;
var block_increment = 0;
var total_height = 0;
var gamestage = -1;
// -1 = title screen
// 0 = pre-animation
// 1 = playing
// 2 = game over

var stoptime = 0;

var keydown_b = false;

var score = 0;

cursor_x = 2;
cursor_y = 11;


function get_game_mode(){
	var gamemode_radio = document.getElementsByName("gamemode");
	for(var i = 0; i < gamemode_radio.length; ++i){
		if(gamemode_radio[i].checked) return gamemode_radio[i].value;
	}
}


function reset_board(){
	
	colours = parseInt(document.getElementById("colours").value);
	perblock_disappeartime = parseInt(document.getElementById("blockspeed").value);
	init_flashtime = perblock_disappeartime * 3;
	init_disappeartime = perblock_disappeartime * 5;
	
	gamestage = 0;

	block_increment = 0;
	total_height = 0;

	for(var a = 0; a < 13; ++a){
		for(var b = 0; b < 6; ++b){
			blockgrid[a][b] = new block(0);
		}
	}

	gen_blocks();
	preanisecs = 3;
	elapsed_time = 0;
	stoptime = 0;

	score = 0;
	
	start_level = parseInt(document.getElementById("level").value);
	
	time_level = 1;
	block_level = 1;
	total_blocks = 0;
	recalc_speed();
	
	document.getElementById("speeddisp").innerHTML = speed_level;
	document.getElementById("timedisp").innerHTML = "00'00\"00";

	levelup_secs = init_levelup_secs;

	cursor_x = 2;
	cursor_y = 11;
	
	game_mode = get_game_mode();
	
}



function gen_blocks(){
	
	// generate five rows to start
	for(var a = 7; a < 13; ++a){
		for(var b = 0; b < 6; ++b){
			blockgrid[a][b] = new block(randint(1, colours));
			// if it would create a row of 3, try again
			var nothree = false;
			while(nothree == false){
				nothree = true;
				if(a >= 9){
					if(blockgrid[a][b].colour == blockgrid[a-1][b].colour && blockgrid[a-1][b].colour == blockgrid[a-2][b].colour){
						nothree = false;
						blockgrid[a][b].colour = randint(1, colours);
					}
				}
				if(b >= 2){
					if(blockgrid[a][b].colour == blockgrid[a][b-1].colour && blockgrid[a][b-1].colour == blockgrid[a][b-2].colour){
						nothree = false;
						blockgrid[a][b].colour = randint(1, colours);
					}
				}
			}
		}
	}

}




// actual game code

function recalc_speed(){
	speed_level = time_level + block_level + start_level - 2;
	// adv_speed = 0.3;
	adv_speed = 0.025 * Math.pow(speed_level, 1.25) - 0.025 * Math.pow(speed_level, 1.10) + 0.03;
	document.getElementById("speeddisp").innerHTML = speed_level;
	// document.getElementById("debugbox").innerHTML = "Current speed: " + adv_speed.toFixed(3) + " blocks/sec";
}


function repr_time(secs){
	var intsecs = Math.floor(secs);
	var centisecs = Math.floor((secs - intsecs) * 100);

	return "" + (Math.floor(intsecs / 600)) + (Math.floor(intsecs / 60) % 10) + "\'" + (Math.floor(intsecs / 10) % 6) + (intsecs % 10) + "\"" + (Math.floor(centisecs / 10)) + (centisecs % 10);
}



var preanisecs = 0;

var init_levelup_secs = 30;
var levelup_secs = 0;

var mspf = 10;
var framesecs = 0;


function blocks_clearing(){
	for(var a = 0; a < 12; ++a){
		for(var b = 0; b < 6; ++b){
			if(blockgrid[a][b].blockstate == 1 | blockgrid[a][b].blockstate == 2) return true;
		}
	}
	return false;
}

function blocks_falling(){
	for(var a = 0; a < 12; ++a){
		for(var b = 0; b < 6; ++b){
			if(blockgrid[a][b].blockstate == 3) return true;
		}
	}
	return false;
}

// advances 1 frame at 100 fps.
function update_gamestate(){

	if(gamestage == -1){
		

	}else if(gamestage == 0){

		preanisecs -= (mspf / 1000);
		// do animation stuff here
		if(preanisecs > 3){
			ai = false;
		}else if(preanisecs > 0){
			ai = true;
			document.getElementById("msgbox").innerHTML = Math.ceil(preanisecs);
		}else{
			document.getElementById("msgbox").innerHTML = ""
			preanisecs = 0;
			gamestage = 1;
		}


	}else if(gamestage == 1){

		elapsed_time += 0.01;
		
		if(game_mode == "timed"){
			document.getElementById("timedisp").innerHTML = repr_time(120 - elapsed_time);
		}else{
			document.getElementById("timedisp").innerHTML = repr_time(elapsed_time);
		}
		
		if(stoptime >= 0) debugbox.innerHTML = "STOP " + stoptime.toFixed(2);

		if(!blocks_clearing() && !blocks_falling()){
			if(stoptime > 0){
				stoptime -= 0.01;
			}else{
				block_increment = block_increment + (adv_speed * 0.01);
				total_height += (adv_speed * 0.01);
			}
		}
		// debugbox.innerHTML = block_increment.toFixed(2);

		// advance speed...
		if(advance){
			block_increment += (adv_speed * 0.01) + 0.05;
			total_height += (adv_speed * 0.01) + 0.05;
		}

		var newrows = false;

		if(block_increment > 12){ // don't ever advance more than 12 blocks at a time
			block_increment -= Math.floor(block_increment - 12);
		}
		
		while(block_increment > 1){
			// shift everything up by 1
			newrows = true;
			block_increment -= 1;
			cursor_y -= 1;
			for(var a = 0; a < 12; ++a){
				for(var b = 0; b < 6; ++b){
					blockgrid[a][b] = blockgrid[a+1][b];
				}
			}
			for(var b = 0; b < 6; ++b){
				blockgrid[12][b] = new block(randint(1, colours));
				var nothree = true;
				while(nothree){
					nothree = false;
					if(blockgrid[12][b].colour == blockgrid[11][b].colour && blockgrid[12][b].colour == blockgrid[10][b].colour)
						nothree = true;
					if(b >= 2){
						if(blockgrid[12][b].colour == blockgrid[12][b-1].colour && blockgrid[12][b].colour == blockgrid[12][b-2].colour)
							nothree = true;
					}
					if(nothree){
						blockgrid[12][b].colour = randint(1, colours);
					}
				}
			}
			if(advance == true){
				score += 1;
				var toprow = false;
				for(var b = 0; b < 6; ++b){
					if(blockgrid[0][b].colour != 0){
						toprow = true;
					}
				}
				if(keydown_b == false || toprow == true){
					advance = false;
					block_increment = Math.floor(block_increment);
				}
			}
		}

		if(newrows){
			if(check_for_3() == 0 & !blocks_clearing() && !blocks_falling()){
				for(var b = 0; b < 6; ++b){
					if(blockgrid[0][b].colour != 0){
						gamestage = 2; // game over
						preanisecs = 1;
					}
				}
			}
		}else{
			if(!blocks_clearing() && !blocks_falling()){
				for(var b = 0; b < 6; ++b){
					if(blockgrid[0][b].colour != 0){
						gamestage = 2; // game over
						preanisecs = 1;
					}
				}
			}
		}		

		levelup_secs -= 0.01;
		while(levelup_secs <= 0){
			levelup_secs += init_levelup_secs;
			time_level += 1;
			recalc_speed();
		}

		for(var a = 0; a < 12; ++a){
			for(var b = 0; b < 6; ++b){
				if(blockgrid[a][b].blockstate == 1){
					blockgrid[a][b].flashtime -= 1;
					if(blockgrid[a][b].flashtime <= 0){
						blockgrid[a][b].blockstate = 2;
					}
				}else if(blockgrid[a][b].blockstate == 2){
					blockgrid[a][b].disappeartime -= 1;
					blockgrid[a][b].removetime -= 1;
					if(blockgrid[a][b].disappeartime == 0){
						// the moment the block disappears, the score increases by 10.
						score += 10;
						total_blocks += 1;
						block_level = Math.ceil(total_blocks / 20);
						recalc_speed();
					}
					if(blockgrid[a][b].removetime <= 0){
						// remove the blocks and make the blocks above it fall.
						if(a > 0 && blockgrid[a-1][b].blockstate == 0 && blockgrid[a-1][b].colour != 0){
							for(var c = a-1; c >= 0 && blockgrid[c][b].colour != 0 && blockgrid[c][b].blockstate == 0; --c){
								blockgrid[c][b].blockstate = 3;
								blockgrid[c][b].combo = blockgrid[a][b].combo + 1; // increment the combo counter for falling blocks
								blockgrid[c][b].comboblocks = blockgrid[a][b].comboblocks; // increment the combo blocks counters as well
								blockgrid[c][b].falltime = init_falltime;
							}
						}
						blockgrid[a][b] = new block(0);
					}
				}
			}
		}
		
		if(game_mode == "timed" && elapsed_time >= 120){
			// game over on time-up
			gamestage = 2; // game over
			preanisecs = 1;
		}

		gravity();

	}else if(gamestage == 2){

		if(preanisecs > 0.7){
			block_increment = Math.floor((preanisecs * 100) / 2) % 2 == 0 ? 0.2 : -0.2;
		}
		else if(preanisecs < 0.20){
			block_increment = (0.20 - preanisecs) * -100;
		}
		else{
			block_increment = 0;
		}

		preanisecs -= 0.01;
		if(preanisecs == 0){
			gamestage = -1; // return to main menu
		}

	}

}

function fallen(a, b){

	if(blockgrid[a][b].blockstate == 1 || blockgrid[a][b].blockstate == 2){
		return true;
	}

	for(var c = a + 1; c < 13; ++c){
		if(blockgrid[c][b].blockstate == 3 || blockgrid[c][b].colour == 0){
			return false;
		}else if(blockgrid[c][b].blockstate == 1 || blockgrid[c][b].blockstate == 2){
			return true;
		}
	}
	
	return true;

}


function gravity(){
	
	var moved = false;

	// make all the blocks fall down
	for(var a = 11; a > 0; --a){
		for(var b = 0; b < 6; ++b){
			if(blockgrid[a-1][b].blockstate == 3){
				if(blockgrid[a-1][b].falltime == 0 && blockgrid[a][b].colour == 0 && blockgrid[a][b].blockstate == 0){
					moved = true;
					blockgrid[a][b] = blockgrid[a-1][b];
					blockgrid[a-1][b] = new block(0);
				}else{
					blockgrid[a-1][b].falltime -= 1;
					if(blockgrid[a-1][b].falltime < 0){
						blockgrid[a-1][b].falltime = 0;
					}
				}
			}	
		}
	}

	for(var a = 11; a >= 0; --a){
		for(var b = 0; b < 6; ++b){
			if(blockgrid[a][b].blockstate == 3 && fallen(a, b)){
				blockgrid[a][b].blockstate = 0;
			}
		}
	}

	if(moved){ check_for_3(); }
	
	for (var a = 12; a >= 0; --a){
		for (var b = 0; b < 6; ++b){
			if(blockgrid[a][b].blockstate == 0){
				if(fallen(a, b)){
					// reset combo to 0
					blockgrid[a][b].combo = 0;
					blockgrid[a][b].comboblocks = 0;
				}
			}
		}
	}

}


function check_for_3(){

	marked = new Array(13);
	for(var a = 0; a < 13; ++a){
		marked[a] = new Array(6);
		for(var b = 0; b < 6; ++b){
			marked[a][b] = false;
		}
	}
	
	var max_combo = 0;
	var max_comboblocks = 0;
	
	// vertical
	for(var a = 0; a < 10; ++a){
		for(var b = 0; b < 6; ++b){
			
			if(blockgrid[a][b].colour == blockgrid[a+1][b].colour && blockgrid[a][b].colour == blockgrid[a+2][b].colour && blockgrid[a][b].colour != 0
					&&
				blockgrid[a][b].blockstate == 0 && blockgrid[a+1][b].blockstate == 0 && blockgrid[a+2][b].blockstate == 0){
				marked[a][b] = true;
				marked[a+1][b] = true;
				marked[a+2][b] = true;
			}

		}
	}

	// horizontal
	for(var a = 0; a < 12; ++a){
		for(var b = 0; b < 4; ++b){
			
			if(blockgrid[a][b].colour == blockgrid[a][b+1].colour && blockgrid[a][b].colour == blockgrid[a][b+2].colour && blockgrid[a][b].colour != 0
					&&
				blockgrid[a][b].blockstate == 0 && blockgrid[a][b+1].blockstate == 0 && blockgrid[a][b+2].blockstate == 0){
				marked[a][b] = true;
				marked[a][b+1] = true;
				marked[a][b+2] = true;
			}

		}
	}
	
	var nblocks = 0;

	// now mark those blocks as flashing
	for(var a = 0; a < 12; ++a){
		for(var b = 0; b < 6; ++b){
			if(marked[a][b]){
				blockgrid[a][b].flashtime = init_flashtime;
				blockgrid[a][b].blockstate = 1;
				// also update the combo
				max_combo = Math.max(max_combo, blockgrid[a][b].combo);
				max_comboblocks = Math.max(max_comboblocks, blockgrid[a][b].comboblocks);
				++nblocks;
			}
		}
	}

	// combo bonus
	if(nblocks > 3)
		score += (nblocks - 3) * 25 + ((nblocks - 3) * (nblocks - 3) * 5);
	if(max_combo > 0)
		score += max_combo * max_comboblocks * 10;
	
	// also give stop time
	var init_stoptime = 0;
	if(nblocks > 3)
		init_stoptime += 0.5 * nblocks;
	if(max_combo > 0)
		init_stoptime += 1 + 2 * max_combo;

	if(init_stoptime > stoptime) stoptime = init_stoptime;

	var nblock = 0;

	for(var a = 0; a < 12; ++a){
		for(var b = 0; b < 6; ++b){
			if(marked[a][b]){
				blockgrid[a][b].disappeartime = init_disappeartime + nblock * perblock_disappeartime;
				blockgrid[a][b].removetime = init_disappeartime + (nblocks - 1) * perblock_disappeartime;
				blockgrid[a][b].combo = max_combo;
				blockgrid[a][b].comboblocks = max_comboblocks + nblocks;
				++nblock;
			}
		}
	}

	return nblocks;

}


function redraw(){

	blockbox.clearRect(0, 0, 720, 720);

	var block_height = Math.floor(blocksize * block_increment);

	// cursor
	
	if(gamestage == 0 || gamestage == 1){
		blockbox.fillStyle = "#000000";
		blockbox.fillRect(cursor_x * blocksize - 1, cursor_y * blocksize - block_height - 1, blocksize * 2 + 2, blocksize + 2);
	}

	// blocks

	for(var a = 0; a < 13; ++a){
		for(var b = 0; b < 6; ++b){

			if(gamestage == 2){
				if(blockgrid[a][b].colour != 0){
					blockbox.fillStyle = "#333333";
				}else{
					blockbox.fillStyle = "#ffffff";
				}
				blockbox.fillRect(b*blocksize + 1, a*blocksize + 1 - block_height, blocksize-2, blocksize-2);
				continue;
			}

			if(blockgrid[a][b].blockstate == 0 || blockgrid[a][b].blockstate == 3){
				switch(blockgrid[a][b].colour){
					case 1:
						blockbox.fillStyle = "#ff0000"; break;
					case 2:
						blockbox.fillStyle = "#ffff00"; break;
					case 3:
						blockbox.fillStyle = "#00ff00"; break;
					case 4:
						blockbox.fillStyle = "#00ffff"; break;
					case 5:
						blockbox.fillStyle = "#ff00ff"; break;
					case 6:
						blockbox.fillStyle = "#0000ff"; break;
					case 7:
						blockbox.fillStyle = "#000000"; break;
					default:
						blockbox.fillStyle = "#ffffff";
				}
				blockbox.fillRect(b*blocksize + 1, a*blocksize + 1 - block_height, blocksize-2, blocksize-2);
			}else if(blockgrid[a][b].blockstate == 1){
				// a just-matched block
				if(blockgrid[a][b].flashtime % 6 < 3){
					blockbox.fillStyle = "#999999";
				}else{
					blockbox.fillStyle = "#cccccc";
				}
				blockbox.fillRect(b*blocksize + 1, a*blocksize + 1 - block_height, blocksize-2, blocksize-2);
				if(blockgrid[a][b].combo > 0){
					blockbox.font = "24px Arial";
					blockbox.textAlign = "center";
					if(blockgrid[a][b].flashtime % 6 < 3)
						blockbox.fillStyle = "#ffffff";
					else
						blockbox.fillStyle = "#333333";
					blockbox.fillText("x" + (blockgrid[a][b].combo + 1), b*blocksize + 1 + blocksize / 2, a*blocksize + 1 + blocksize * 0.8 - block_height);
				}
			}else if(blockgrid[a][b].blockstate == 2){
				if(blockgrid[a][b].disappeartime > 0){
					blockbox.fillStyle = "#666666";
				}else{
					blockbox.fillStyle = "#ffffff";
				}
				blockbox.fillRect(b*blocksize + 1, a*blocksize + 1 - block_height, blocksize-2, blocksize-2);
				if(blockgrid[a][b].combo > 0){
					blockbox.font = "24px Arial";
					blockbox.textAlign = "center";
					blockbox.fillStyle = "#ffffff";
					blockbox.fillText("x" + (blockgrid[a][b].combo + 1), b*blocksize + 1 + blocksize / 2, a*blocksize + 1 + blocksize * 0.8 - block_height);
				}
			}
			blockbox.fillStyle = "#000000";
			//blockbox.fillText(blockgrid[a][b].combo, b*blocksize + 1 + 19, a*blocksize+1 - block_height + 8 + 9);
			//blockbox.fillText(blockgrid[a][b].comboblocks, b*blocksize + 1 + 19, a*blocksize+1 - block_height + 8 + 18);
			//blockbox.fillText(blockgrid[a][b].blockstate, b*blocksize + 1 + 19, a*blocksize+1 - block_height + 8 + 27);
		}
	}

}


var total_dsec = 0;


function updateF(){
	
	if(paused) return;
	
	var thedate = new Date();

	delta_ms = thedate.getTime() - curtime;
	curtime = thedate.getTime();

	total_dsec += delta_ms;
	
	while(total_dsec >= mspf){
		total_dsec -= mspf;
		update_gamestate();
	}
	
	document.getElementById("scoredisp").innerHTML = score;

	redraw();

}



function swap_blocks(x, y){

	if(gamestage != 1) return;

	if(blockgrid[y][x].blockstate == 0 && blockgrid[y][x+1].blockstate == 0){
		var tempblock = blockgrid[y][x];
		blockgrid[y][x] = blockgrid[y][x+1];
		blockgrid[y][x+1] = tempblock;

		if(blockgrid[y][x].colour == 0){
			// there might be blocks above it now
			for(var c = y - 1; c >= 0 && blockgrid[c][x].blockstate == 0 && blockgrid[c][x].colour != 0; --c){
				blockgrid[c][x].blockstate = 3;
				blockgrid[c][x].falltime = switch_falltime;
			}
		}else if(blockgrid[y+1][x].colour == 0 || !fallen(y, x)){
			blockgrid[y][x].blockstate = 3;
			blockgrid[y][x].falltime = switch_falltime;
		}

		if(blockgrid[y][x+1].colour == 0){
			// there might be blocks above it now
			for(var c = y - 1; c >= 0 && blockgrid[c][x+1].blockstate == 0 && blockgrid[c][x+1].colour != 0; --c){
				blockgrid[c][x+1].blockstate = 3;
				blockgrid[c][x+1].falltime = switch_falltime;
			}
		}else if(blockgrid[y+1][x+1].colour == 0 || !fallen(y, x+1)){
			blockgrid[y][x+1].blockstate = 3;
			blockgrid[y][x+1].falltime = switch_falltime;
		}

	}

}


function process_input(e){

	if(!ai) return;

	switch(e.keyCode){
		case 38: // up
			e.preventDefault();
			cursor_y = Math.max(Math.ceil(block_increment), cursor_y - 1);
			break;
		case 40: // down
			e.preventDefault();
			cursor_y = Math.min(11, cursor_y + 1);
			break;
		case 37: // left
			e.preventDefault();
			cursor_x = Math.max(0, cursor_x - 1);
			break;
		case 39: // right
			e.preventDefault();
			cursor_x = Math.min(4, cursor_x + 1);
			break;
		case 32: // space = A
			e.preventDefault();
			// swap two blocks
			
			if(elapsed_time >= 0){
				swap_blocks(cursor_x, cursor_y);
			}
			
			// check for 3
			
			check_for_3();

			break;
		case 88: // X = B
			e.preventDefault();
			keydown_b = true;
			var toprow = false;
			for(var b = 0; b < 6; ++b){
				if(blockgrid[0][b].colour != 0){
					toprow = true;
				}
			}
			if(toprow == false)
				advance = true;
			stoptime = 0; // stoptime cancels on advance.
	 }

}

function release_key(e){

	if(!ai) return;

	if(e.keyCode == 88){
		keydown_b = false;
	}

}




///////////////////////////////
// Auxiliary interface stuff //
///////////////////////////////

function open_settings(){
	document.getElementById("settingbox").style.display = "block";
}

function close_settings(){
	document.getElementById("settingbox").style.display = "none";
}
