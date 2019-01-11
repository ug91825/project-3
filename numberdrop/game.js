// Global variables

var numberbox_o;
var number;

var debugbox;

var curtime;

// Loading code; this is what starts everything

function load_everything(){

	debugbox = document.getElementById("debugbox");

	numberbox_o = document.getElementById("numberbox");
	numberbox = numberbox_o.getContext("2d");

	numberbox_o.onclick = function(e) {

		if(e.hasOwnProperty('offsetX')){
			var x = e.offsetX;
			var y = e.offsetY;
		}else{
			var x = e.layerX;
			var y = e.layerY;
		}
		
		// select column code here in a moment.
		if(x > 20 && x < 260){
			select_column(Math.floor((x - 15) / 50));
		}

	};

	var thedate = new Date();
	curtime = thedate.getTime();

	setInterval(updateF, 1);
	
	document.onkeydown = function(e){
		if(e.keyCode > 48 && e.keyCode <= 53){
			select_column(e.keyCode - 49);
		}else if(e.keyCode == 78){
			reset_board();
		}else if(e.keyCode == 32 || e.keyCode == 13){
			drop_numbers();
		}else if(e.keyCode == 8){
			reset_numbers();
		}
	}

}

// Game State.

var score = 0;
var round_score = 0;
var level = 0;

var plus_score = 0;
var plus_time = 0;

var animation_state = -1;
// 0 = accepts input
// 1 = is animating a number column
// 2 = is spawning numbers
// 3 = numbers are being pushed down
// 4 = numbers are falling
// 5 = round is finished; time bonus
// 6 - numbers are being reset

// -1 = title screen

var game_over = false;

// Game data.

var columns = new Array(5);
for(var a = 0; a < 5; ++a){
	columns[a] = new Array(10);
	for(var b = 0; b < 10; ++b){
		columns[a][b] = "";
	}
}

var roundbar = 0;

// Interface tweaking




// Game settings



// 1 = classic


// Timers

time_left = 120;


function reset_board(){
	
	game_over = false;
	
	score = 0;
	round_score = 0;
	level = 1;
	plus_score = 0;
	document.getElementById("scoredisp").innerHTML = score;
	
	document.getElementById("gameoverbox").style.display = "none";
	
	animation_state = 0;
	time_left = 120;
	
	regen_numbers();

}


function regen_numbers(){

	// generate 8 valid equations
	for(var a = 0; a < 8; ++a){
		// equation generation (use + or -)
		var oper = Math.random() >= 0.5 ? "+" : "-";
		var operand1, operand2, result;
		
		var maxnum = 15 + level * 5;
		
		if(oper == "+"){
			operand1 = Math.floor(Math.random() * Math.random() * maxnum);
			operand2 = Math.floor(Math.random() * (maxnum - operand1));
			result = operand1 + operand2;
		}else if(oper == "-"){
			operand1 = Math.floor(Math.random() * maxnum) + 1;
			operand2 = Math.floor(Math.random() * (operand1));
			result = operand1 - operand2;
		}
		columns[0][a] = "" + operand1;
		columns[1][a] = oper;
		columns[2][a] = "" + operand2;
		columns[3][a] = "=";
		columns[4][a] = "" + result;
	}
	for(var a = 8; a < 10; ++a){
		for(var b = 0; b < 5; ++b){
			columns[b][a] = "";
		}
	}
	
	// now swap them around a bit
	for(var a = 0; a < 5; ++a){
		for(var b = 0; b < 7; ++b){
			if(Math.random() < 0.4){
				var temp = columns[a][b];
				columns[a][b] = columns[a][b+1];
				columns[a][b+1] = temp;
			}
		}
	}
	
	
}

function end_game(){
	game_over = true;
	animation_state = -1;
	document.getElementById("gameoverbox").style.display = "block";
}


var column_anisecs = 0.1;

var animated_column = -1;
var column_anileft = 0;

var sweep_anisecs = 0;
var sweep_anipx = 0;

var falling_numbers = ["", "", "", "", ""];
var falling_anisecs = 0;
var falling_anipx = 0;
var falling_positions = [0, 0, 0, 0, 0];

var eqnscore = 500;
var timebonusspeed = 100;


function update_gamestate(delta_time){
	
	
	if(animation_state != -1){
		time_left -= delta_time;
		var secs_left = Math.ceil(time_left);
		
		if(time_left <= 0){
			document.getElementById("timedisp").innerHTML = "0:00";
			end_game();
			return;
		}
		
		document.getElementById("timedisp").innerHTML = sprintf("%d:%02d", secs_left / 60, secs_left % 60);
	}
	
	
	if(animation_state == 1){
		
		column_anileft -= (delta_time / column_anisecs);
		if(column_anileft <= 0){
			column_anileft = 0;
			aniamted_column = 0;
			
			animation_state = 0;
		}
		
	}else if(animation_state == 2){
		
		sweep_anisecs += delta_time;
		sweep_anipx = 4000 * sweep_anisecs * sweep_anisecs;
		
		if(sweep_anipx >= 300){
			animation_state = 3;
			sweep_anisecs = 0;
			sweep_anipx = 0;
			// recalculate where the numbers go.
			
			for(var a = 0; a < 5; ++a){
				falling_numbers[a] = columns[a][8];
				columns[a][8] = "";
				columns[a][9] = "";
				for(var b = 7; b > 0; --b){
					columns[a][b] = columns[a][b-1];
				}
				columns[a][0] = "";
				for(var b = 7; b >= 0; --b){
					if(columns[a][b] == ""){
						falling_positions[a] = b;
						break;
					}
				}
			}
			
			column_anileft = 1;
			
		}
		
	}else if(animation_state == 3){
		
		column_anileft -= (delta_time / column_anisecs);
		if(column_anileft <= 0){
			column_anileft = 0;
			aniamted_column = 0;
			
			animation_state = 4;
		}
		
	}else if(animation_state == 4){
		
		falling_anisecs += delta_time;
		falling_anipx = 4000 * falling_anisecs * falling_anisecs;
		
		if(done_falling()){
		
			for(var a = 0; a < 5; ++a){
				if(falling_numbers[a] != ""){
					columns[a][falling_positions[a]] = falling_numbers[a];
				}
			}
			
			falling_anisecs = 0;
			falling_anipx = 0;
			animation_state = 0;
			
			if(no_moves_left()){
				if(round_score < 5){
					end_game();
				}else{
					animation_state = 5; // start calculating time bonus.
				}
			}
			
		}
		
	}else if(animation_state == 5){
		
		if(delta_time * timebonusspeed > time_left){
			score += time_left * timebonusspeed;
			// start new round
			level += 1;
			round_score = 0;
			time_left = 120;
			regen_numbers();
			animation_state = 0;
		}else{
			time_left -= delta_time * timebonusspeed;
			score += delta_time * 10 * timebonusspeed * (level * 0.5 + 0.5);
			document.getElementById("scoredisp").innerHTML = Math.floor(score);
		}
		
	}else if(animation_state == 6){
	
		sweep_anisecs += delta_time;
		sweep_anipx = 4000 * sweep_anisecs * sweep_anisecs;
		
		if(sweep_anipx >= 250){
			animation_state = 4;
			sweep_anisecs = 0;
			sweep_anipx = 0;
			// recalculate where the numbers go.
			
			for(var a = 0; a < 5; ++a){
				falling_numbers[a] = columns[a][8];
				columns[a][8] = "";
				columns[a][9] = "";
				for(var b = 7; b >= 0; --b){
					if(columns[a][b] == ""){
						falling_positions[a] = b;
						break;
					}
				}
			}
			
			column_anileft = 1;
			
		}
		
	}

}

function done_falling(){
	
	for(var a = 0; a < 5; ++a){
		if(falling_numbers[a] == "") continue;
		if(falling_anipx < 150 + 30 * falling_positions[a]) return false;
	}
	
	return true;
	
}

function no_moves_left(){
	
	for(var a = 0; a <= 7; ++a){
		if(columns[0][a] != ""){
		for(var b = 0; b <= 7; ++b){
			if(columns[1][b] != ""){
			for(var c = 0; c <= 7; ++c){
				if(columns[2][c] != ""){
				for(var d = 0; d <= 7; ++d){
					if(columns[4][d] != ""){
					
					// equation-checking code
						var operand1 = parseInt(columns[0][a]);
						var operand2 = parseInt(columns[2][c]);
						var result = parseInt(columns[4][d]);
						if(columns[1][b] == "+"){
							if(result == operand1 + operand2){
								return false;
							}
						}else if(columns[1][b] == "-"){
							if(result == operand1 - operand2){
								return false;
							}
						}
					
				}}
			}}
		}}
	}}
	
	return true;
	
}


function select_column(column){
	
	if(animation_state != 0) return;
	if(columns[column][9] != "") return;  // something's in the bottom column already
	
	for(var a = 9; a > 0; --a){
		columns[column][a] = columns[column][a-1];
	}
	columns[column][0] = "";
	
	animated_column = column;
	column_anileft = 1;
	
	animation_state = 1;
	
}

multiplier = [1, 1, 1, 1, 1, 2, 3, 4];

function drop_numbers(){
	
	if(animation_state != 0) return; // if animations are running, don't allow.
	
	// first check whether the current equation is valid. If not, reject.
	var operand1 = parseInt(columns[0][7]);
	var operand2 = parseInt(columns[2][7]);
	var result = parseInt(columns[4][7]);
	if(columns[1][7] == "+"){
		if(result != operand1 + operand2){
			return;
		}else{
			animation_state = 2;
			plus_score += eqnscore * level * multiplier[round_score];
			round_score += 1;
		}
	}else if(columns[1][7] == "-"){
		if(result != operand1 - operand2){
			return;
		}else{
			animation_state = 2;
			plus_score += eqnscore * level * multiplier[round_score];
			round_score += 1;
		}
	}
	
}


function reset_numbers(){
	
	if(animation_state != 0) return; // if animations are running, don't allow.
	
	plus_time = -5;
	animation_state = 6;
	
}


// Rendering code.

function redraw(){

// update all the information from the game state.

	numberbox.clearRect(0, 0, 280, 480);

	numberbox.textAlign = "center";
	numberbox.font = "16pt Arial";
	
	
	// energy bar
	
	if(roundbar < round_score){
		roundbar = Math.min(round_score, roundbar + 0.1);
	}else if(roundbar > round_score){
		roundbar = Math.max(round_score, roundbar - 0.1);
	}
	numberbox.fillStyle = "#ccccff";
	numberbox.fillRect(20, 420, 48 * roundbar, 40);
	
	// numbers
	
	numberbox.fillStyle = "#000000";
	
	if(animation_state == 1){
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * (b - (column_anileft * (animated_column == a))));
			}
			for(var b = 7; b < 10; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a,  -3 + 50 * (b - (column_anileft * (animated_column == a))));
			}
		}
	}else if(animation_state == 2){
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * b);
			}
			numberbox.fillText(columns[a][7], 40 + 50 * a - sweep_anipx, 347);
			numberbox.fillText(columns[a][8], 40 + 50 * a + sweep_anipx, 397);
			numberbox.fillText(columns[a][9], 40 + 50 * a, 447 + sweep_anipx * 0.8);
		}
	}else if(animation_state == 3){
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * (b - (column_anileft)));
			}
			for(var b = 7; b < 10; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a,  -3 + 50 * (b - (column_anileft)));
			}
		}
	}else if(animation_state == 4){
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * b);
			}
			for(var b = 7; b < 10; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a,  -3 + 50 * b);
			}
			if(falling_numbers[a] != ""){
				numberbox.fillText(falling_numbers[a], 40 + 50 * a, falling_anipx - 30);
			}
		}
	}else if(animation_state == 6){
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * b);
			}
			numberbox.fillText(columns[a][7], 40 + 50 * a, 347);
			numberbox.fillText(columns[a][8], 40 + 50 * a + sweep_anipx, 397);
			numberbox.fillText(columns[a][9], 40 + 50 * a, 447 + sweep_anipx * 0.8);
		}
	}else{
		for(var a = 0; a < 5; ++a){
			for(var b = 0; b < 7; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a, 120 + 30 * b);
			}
			for(var b = 7; b < 10; ++b){
				numberbox.fillText(columns[a][b], 40 + 50 * a,  -3 + 50 * b);
			}
		}
	}

	
	// columns
	
	numberbox.lineWidth = 1;
	
	numberbox.beginPath();
	numberbox.moveTo(20, 10);
	numberbox.lineTo(20, 310);
	numberbox.lineTo(60, 310);
	numberbox.lineTo(60, 10);
	numberbox.lineTo(20, 10);
	numberbox.stroke();
	
	numberbox.beginPath();
	numberbox.moveTo(70, 10);
	numberbox.lineTo(70, 310);
	numberbox.lineTo(110, 310);
	numberbox.lineTo(110, 10);
	numberbox.lineTo(70, 10);
	numberbox.stroke();
	
	
	numberbox.beginPath();
	numberbox.moveTo(120, 10);
	numberbox.lineTo(120, 310);
	numberbox.lineTo(160, 310);
	numberbox.lineTo(160, 10);
	numberbox.lineTo(120, 10);
	numberbox.stroke();
	
	numberbox.beginPath();
	numberbox.moveTo(170, 10);
	numberbox.lineTo(170, 310);
	numberbox.lineTo(210, 310);
	numberbox.lineTo(210, 10);
	numberbox.lineTo(170, 10);
	numberbox.stroke();
	
	
	numberbox.beginPath();
	numberbox.moveTo(220, 10);
	numberbox.lineTo(220, 310);
	numberbox.lineTo(260, 310);
	numberbox.lineTo(260, 10);
	numberbox.lineTo(220, 10);
	numberbox.stroke();
	
	
	
	// answer box
	
	numberbox.strokeStyle = "#ff0000";
	numberbox.beginPath();
	numberbox.moveTo(20, 320);
	numberbox.lineTo(60, 320);
	numberbox.lineTo(60, 330);
	numberbox.lineTo(70, 330);
	numberbox.lineTo(70, 320);
	numberbox.lineTo(110, 320);
	numberbox.lineTo(110, 330);
	numberbox.lineTo(120, 330);
	numberbox.lineTo(120, 320);
	numberbox.lineTo(160, 320);
	numberbox.lineTo(160, 330);
	numberbox.lineTo(170, 330);
	numberbox.lineTo(170, 320);
	numberbox.lineTo(210, 320);
	numberbox.lineTo(210, 330);
	numberbox.lineTo(220, 330);
	numberbox.lineTo(220, 320);
	numberbox.lineTo(260, 320);
	numberbox.lineTo(260, 360);
	numberbox.lineTo(220, 360);
	numberbox.lineTo(220, 350);
	numberbox.lineTo(210, 350);
	numberbox.lineTo(210, 360);
	numberbox.lineTo(170, 360);
	numberbox.lineTo(170, 350);
	numberbox.lineTo(160, 350);
	numberbox.lineTo(160, 360);
	numberbox.lineTo(120, 360);
	numberbox.lineTo(120, 350);
	numberbox.lineTo(110, 350);
	numberbox.lineTo(110, 360);
	numberbox.lineTo(70, 360);
	numberbox.lineTo(70, 350);
	numberbox.lineTo(60, 350);
	numberbox.lineTo(60, 360);
	numberbox.lineTo(20, 360);
	numberbox.lineTo(20, 320);
	numberbox.stroke();
	
	// return chute
	
	numberbox.strokeStyle = "#000000";
	numberbox.beginPath();
	numberbox.moveTo(20, 370);
	numberbox.lineTo(60, 370);
	numberbox.lineTo(60, 380);
	numberbox.lineTo(70, 380);
	numberbox.lineTo(70, 370);
	numberbox.lineTo(110, 370);
	numberbox.lineTo(110, 380);
	numberbox.lineTo(120, 380);
	numberbox.lineTo(120, 370);
	numberbox.lineTo(160, 370);
	numberbox.lineTo(160, 380);
	numberbox.lineTo(170, 380);
	numberbox.lineTo(170, 370);
	numberbox.lineTo(210, 370);
	numberbox.lineTo(210, 380);
	numberbox.lineTo(220, 380);
	numberbox.lineTo(220, 370);
	numberbox.lineTo(260, 370);
	numberbox.lineTo(260, 410);
	numberbox.lineTo(220, 410);
	numberbox.lineTo(220, 400);
	numberbox.lineTo(210, 400);
	numberbox.lineTo(210, 410);
	numberbox.lineTo(170, 410);
	numberbox.lineTo(170, 400);
	numberbox.lineTo(160, 400);
	numberbox.lineTo(160, 410);
	numberbox.lineTo(120, 410);
	numberbox.lineTo(120, 400);
	numberbox.lineTo(110, 400);
	numberbox.lineTo(110, 410);
	numberbox.lineTo(70, 410);
	numberbox.lineTo(70, 400);
	numberbox.lineTo(60, 400);
	numberbox.lineTo(60, 410);
	numberbox.lineTo(20, 410);
	numberbox.lineTo(20, 370);
	numberbox.stroke();
	
	// drop zone
	
	numberbox.beginPath();
	numberbox.lineWidth = 2;
	numberbox.moveTo(20, 420);
	numberbox.lineTo(260, 420);
	numberbox.lineTo(260, 460);
	numberbox.lineTo(20, 460);
	numberbox.lineTo(20, 420);
	numberbox.stroke();
	
	// mask outside
	
	numberbox.fillStyle = "#ffffff";
	numberbox.fillRect(0, 0, 280, 9);
	numberbox.fillRect(0, 311, 280, 8);
	numberbox.fillRect(0, 361, 280, 8);
	numberbox.fillRect(0, 411, 280, 8);
	numberbox.fillRect(0, 461, 280, 20);
	numberbox.fillRect(-1, 0, 20, 480);
	numberbox.fillRect(261, 0, 20, 480);
	
	// plus score
	
	if(plus_score > 0){
	
		var scorevel = Math.min(plus_score, Math.max(1, Math.floor(plus_score * 0.2)));
		score += scorevel;
		plus_score -= scorevel;
		document.getElementById("scoredisp").innerHTML = Math.floor(score);
		
	}else if(plus_score < 0){
	
		var scorevel = Math.max(plus_score, Math.min(-1, Math.ceil(plus_score * 0.2)));
		score += scorevel;
		plus_score -= scorevel;
		document.getElementById("scoredisp").innerHTML = Math.floor(score);
		
	}
	
	// plus time
	
	if(plus_time > 0){
	
		var timevel = Math.min(plus_time, 0.2);
		time_left += timevel;
		plus_time -= timevel;
		var secs_left = Math.ceil(time_left);
		document.getElementById("timedisp").innerHTML = sprintf("%d:%02d", secs_left / 60, secs_left % 60);
		
	}else if(plus_time < 0){
	
		var timevel = Math.max(plus_time, -0.2);
		time_left = Math.max(0, time_left + timevel);
		plus_time -= timevel;
		var secs_left = Math.ceil(time_left);
		document.getElementById("timedisp").innerHTML = sprintf("%d:%02d", secs_left / 60, secs_left % 60);
		
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
	prev_animstate = animation_state;
	animation_state = -1;
}

function close_help(){
	document.getElementById("helpbox").style['display'] = "none";
	animation_state = prev_animstate;
}


function open_about(){
	document.getElementById("aboutbox").style['display'] = "block";
	prev_animstate = animation_state;
	animation_state = -1;
}

function close_about(){
	document.getElementById("aboutbox").style['display'] = "none";
	animation_state = prev_animstate;
}


function open_settings(){
	document.getElementById("settingbox").style['display'] = "block";
	prev_animstate = animation_state;
	animation_state = -1;
}

function close_settings(){
	document.getElementById("settingbox").style['display'] = "none";
	animation_state = prev_animstate;
}