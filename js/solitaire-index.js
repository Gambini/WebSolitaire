
function ChatInputLayout() {
	var total_width = $("div#chatViewPort").width();
	var btn_width = $("button#chatInputSend").width() + 16;
	$("#chatInput").width((total_width - btn_width).toString() + "px")
		.position({my:"right", at:"left", of:"button#chatInputSend"});
	$("#chatInput").height($("button#chatInputSend").height().toString() + "px");
	$("div#chatViewPort").height($("div#chatUsersViewport").height().toString() + "px");
}


$(document).ready(function() {
var chat = chat || {};
var url = "http://nathanstarkey.info:8888/chat";

chat.text = "";

chat.socket = io.connect(url);
chat.socket.on("connect",function() {
	chat.socket.emit("setUsernameInfo",{username:"",color:"#0000ff"});
});

chat.socket.on("chatReceive",function(evt) {
	chat.text = evt.text.concat(chat.text);
	//chat.text = chat.text.concat(evt.text);
	$("div#chattext").html(chat.text);
});


chat.socket.on("receiveUsernameInfo", function(evt) {
	if(evt.success) {
		$("span#usernameDisp").css("color","#" + evt.color)
		.html(evt.username);
	}
});

chat.socket.on("chatUserChange", function(evt) {
	$("div#chatUsers").html(evt.text);
});

//chat stuff 

$("button#chatInputSend").button().click(function(evt) {
	var txt = $("#chatInput").val();
	chat.socket.emit("chatSend", {text: txt});
	$("#chatInput").val("");
});

$("#chatInput").keydown(function(evt) {
	var code = evt.keyCode ? evt.keyCode : evt.which;
	if(code == 13 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) { //enter key
		return false;
	}
})
.keyup(function(evt) {
	var code = evt.keyCode ? evt.keyCode : evt.which;
	if(code == 13 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) { //enter key
		$("button#chatInputSend").trigger("click");
		return false;
	}
});


//user div stuff

$("span#usernameColor").ColorPicker({
	color: "#0000ff",
	onShow: function(cpicker) {
		$(cpicker).fadeIn(200);
		//$("span#usernameColor").position({my:"left top", at:"right top", of:"#input#usernameText"});
		return false;
	},
	onHide: function(cpicker) {
		$(cpicker).fadeOut(200);
		return false;
	},
	onChange: function(hsb,hex,rgb) {
		$("#usernameColor span").css("backgroundColor","#" + hex);
	},
	onSubmit: function(hsb,hex,rgb,cpicker) {
		$(".colorpicker").hide();
		return false;
	}
});

$("span#usernameColor").css("display","none");
$("input#usernameText").css("display","none")
.keyup(function(evt) {
	var code = evt.keyCode ? evt.keyCode : evt.which;
	if(code == 13) {

		chat.socket.emit("setUsernameInfo", {
			username: $("input#usernameText").val(),
			color: $("span#usernameColor span").css("background-color")
		});

		$("span#usernameColor").css("display","none");
		$("input#usernameText").css("display","none");
		$("#usernameDisp").css("display","inline");

	}
});

$("#usernameDisp").click(function(evt) {
	$("span#usernameColor").css("display","inline");
	$("input#usernameText").css("display","inline");
	$("#usernameDisp").css("display","none");
	$("span#usernameColor").show();
});


ChatInputLayout();


});
