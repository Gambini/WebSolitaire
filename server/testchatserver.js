var http = require("http");
var url = require("url");
var io = require("socket.io");

//var server = http.createServer(function(request,response) {
//}).listen(8888);

io = io.listen(8888);

var chat = io
	.of("/chat")
	.on("connection", function(socket) {
		socket.username = "anon";
		socket.on("chatSend", function(txt) {
			if(txt) {
				chat.emit("chatReceive", {
					text: "<p><span style='color:" + socket.username.color + ";'>" +
						socket.username.username + "</span>: " + txt.text + "</p>"});
			}
			else {
				console.log("No txt object for chatSend");
			}
		});

		
		//Event data: {username:string, color:string}
		//if username is an empty string, it will be anon+number
		socket.on("setUsernameInfo", function(name) {
			if(name) {
				if(name.username == "") {
					name.username = "anon" + chat.users.length;
				}
				if(chat.users[socket.username.username])
					delete chat.users[socket.username.username];
				chat.users[name.username] = socket;
				socket.username = name;
				socket.emit("receiveUsernameInfo",{
					success: true,
					username: socket.username.username,
					color: socket.username.color
				});
			}
			else {
				socket.emit("receiveUsernameInfo", {
					success: false,
					username:"",
					color:""
				});
			}
		});

	})
;

//A list of users. Key is the username and value is the socket
chat.users = {};
