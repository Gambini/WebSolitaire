var url = "http://gambini.dyndns.org:8888/chat";

var chat = chat || {};

$(document).ready(function() {
	$("#btnConnect").click(function(evt) {	

		chat.socket = io.connect(url);
		chat.socket.on("connect", function() {
			$("#btnConnect").html("Connected");
			chat.socket.emit("setUsernameInfo", {username:"",color:"#0000ff"});
		});

		chat.socket.on("chatReceive", function(evt) {
			$("div#chatview").append(evt.text);
			console.log(evt);
		});

		chat.socket.on("receiveUsernameInfo", function(evt) {
			if(evt.success) {
				$("span#username").css("color","#" + evt.color)
				.html(evt.username);
			}
			else {
				console.log("Failed to set the username");
			}
		});
	});


	$("#btnSubmit").click(function() {
		var ta = $("textarea#usertext");
		chat.socket.emit("chatSend",{text: $("textarea#usertext").val() });
		$("#usertext").val("");
	});


	$("#usertext").keyup(function(evt) {
		var code = evt.keyCode ? evt.keyCode : evt.which;
		if(code == 13 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) { //enter key
			$("#btnSubmit").trigger("click");
		}
	});

	
	$("span#username").click(function() {
		$("#usernameDialog").dialog("open");
	});


	$("#usernameDialog").dialog({
		title: "Set Username Info",
		autoOpen: false,

		buttons: { Ok: function() {
			chat.socket.emit("setUsernameInfo", 
							 {
								 username: $("#txtUsername").val(),
								 color: $("#unColorSelector div").css("background-color")
							 });
			$("#usernameDialog").dialog("close");
		}
				 },

		hide: 100,
		show: 300,
		modal: false,
		position: {my: "top", at: "bottom", of: "span#username" }
	});


	$("#unColorSelector").ColorPicker({
		color: "#0000ff",
		onShow: function(cpicker) {
			$(cpicker).fadeIn(200);
			$(cpicker).position({my:"top", at:"bottom",of:"#usernameDialog"});
			return false;
		},
		onHide: function(cpicker) {
			$(cpicker).fadeOut(200);
			return false;
		},
		onChange: function(hsb,hex,rgb) {
			$("#unColorSelector div").css("backgroundColor","#" + hex);
		}
	});
});
