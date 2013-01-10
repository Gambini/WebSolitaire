var http = require("http");
var url = require("url");
var io = require("socket.io");
var fs = require("fs");
var util = require("util");

var server = http.createServer(function(request,response) {
	var upath = url.parse(request.url).pathname;
	if(upath == '/') {
		response.writeHead(200, {"content-type":"text/html"});
		var rs = fs.createReadStream("../solitaire-index.html");
		util.pump(rs,response);
	}
	else if(upath.search("/js/") == 0) {
		response.writeHead(200, {"content-type":"text/javascript"});
		var rs = fs.createReadStream("../" + upath);
		util.pump(rs,response);
	}
	else if(upath.search("/css/") == 0) {
		response.writeHead(200, {"content-type":"text/css"});
		var rs = fs.createReadStream("../" + upath);
		util.pump(rs,response);
	}
	else if(upath.search("/images/") == 0) {
		response.writeHead(200, {"content-type":"image/png"});
		var rs = fs.createReadStream("../" + upath);
		util.pump(rs,response);
	}
	else {
		console.log(upath);
		response.writeHead(404, {"content-type":"text/plain"});
		response.end("404");
	}
}).listen(8888);

io = io.listen(server);

//A list of users. Key is the username and value is the socket
var chatusers = {};
var numusers = 0;
var totaleverconnected = 0;

var chat = io
	.of("/chat")
	.on("connection", function(socket) {
		socket.username = "anon";
		++numusers;
		++totaleverconnected;

		function FormatUsername(name,color) {
			var ret ="";
			ret = ret.concat("<span style='color:" + color + ";'>");
			ret = ret.concat(name + "</span>");
			return ret;
		}

		function SendChatUserChange() {
			var ret = {text:""};
			for(var user in chatusers) {
				ret.text = ret.text.concat(FormatUsername(user,chatusers[user].username.color) 
										   + "<br />");
			}
			socket.emit("chatUserChange", ret);
		}
		
		
		socket.on("chatSend", function(txt) {
			if(txt) {
				chat.emit("chatReceive", {
					text: FormatUsername(socket.username.username,socket.username.color) +
						": " + txt.text + "<br />"});
			}
			else {
				console.log("No txt object for chatSend");
			}
		});


		socket.on("disconnect",function() {
			if(chatusers[socket.username.username]) {
				delete chatusers[socket.username.username];
				--numusers;
			}
			SendChatUserChange();
		});
		
		//Event data: {username:string, color:string}
		//if username is an empty string, it will be anon+number
		socket.on("setUsernameInfo", function(name) {
			if(name) {
				if(name.username == "") {
					name.username = "anon" + totaleverconnected;
				}
				if(chatusers[socket.username.username])
					delete chatusers[socket.username.username];
				chatusers[name.username] = socket;
				socket.username = name;
				socket.emit("receiveUsernameInfo",{
					success: true,
					username: socket.username.username,
					color: socket.username.color
				});
				SendChatUserChange();
			}
			else {
				socket.emit("receiveUsernameInfo", {
					success: false,
					username:"",
					color:""
				});
			}
		});

	});


