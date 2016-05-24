
/*

	input.js

*/
var cp = require("copy-paste");

var keypress = require('keypress');
var readline = require('readline');

module.exports = Input;

// its gonna be a function write term text
var handle = null;

// state variables
var command = '';
var history = [];
var current = 0;
var cur_char = 0;

function Input(_handle){
	handle = _handle;

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(data){
		handle_data(data);
	});

	set_up_keyevents();
}

function handle_data(text, callback){
	if(text.match(/[ -~]/)){
		var first = command.substring(0, cur_char);
		var last = command.substring(cur_char, command.length);
		command = first + text + last;
		write_terminal_prompt(command, - last.length);
		cur_char += text.length;
	}
}

function set_up_keyevents(){

	keypress(process.stdin);

	process.stdin.setRawMode(true);
	process.stdin.on('keypress', function (ch, key) {

		if (key) {

			if(key.name === 'c' && key.ctrl){
				process.stdout.write('\nGood bye.\n');
				process.exit();
			}

			if(key.name === 'v' && key.ctrl){
				cp.paste(function(err, data){

					var first = command.substring(0, cur_char);
					var last = command.substring(cur_char, command.length);
					command = first + data + last;
					write_terminal_prompt(command, - last.length);
					cur_char += command.length;
				});
				return;
			}

			switch(key.name){
				case('up'): up_key(); break;
				case('down'): down_key(); break;
				case('right'): right_key(); break;
				case('left'): left_key(); break;
				case('backspace'): backspace_key(); break;
				case('return'): return_key(); break;
			}
		}
	});
}

function return_key(){
	history.push(command);
	process.stdout.write('\n');
	handle(command);
	current = history.length;
	command = '';
	cur_char = 0;
}

function up_key(){
	if(history.length === 0 || current === 0){
		return;
	}

	current--;
	command = history[current];
	write_terminal_prompt(command);
}

function down_key(){

	if(history.length === 0 || current === history.length){
		return;
	}

	current++;
	command = (current === history.length) ? '' : history[current];
	write_terminal_prompt(command);
}

function right_key(){
	if(cur_char < command.length){
		cur_char++;
		readline.moveCursor(process.stdout, 1, 0);
	}
}

function left_key(){
	if(cur_char !== 0){
		cur_char--;
		readline.moveCursor(process.stdout, -1, 0);
	}
}

function backspace_key(){
	var first = command.substring(0, cur_char - 1);
	var second = command.substring(cur_char, command.length);
	command = first + second;
	cur_char--;
	write_terminal_prompt(command, - second.length);
}

function write_terminal_prompt(cmd, cursor_x){

	readline.clearLine(process.stdout);
	readline.cursorTo(process.stdout, 0);
	handle(false);
	process.stdout.write(cmd);

	if(cursor_x){
		readline.moveCursor(process.stdout, cursor_x, 0);
	}	
}
