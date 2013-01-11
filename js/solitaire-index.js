
function ChatInputLayout() {
    var total_width = $("div#chatViewPort").width();
    var btn_width = $("button#chatInputSend").width() + 16;
    $("#chatInput").width((total_width - btn_width).toString() + "px")
	.position({my:"right", at:"left", of:"button#chatInputSend"});
    $("#chatInput").height($("button#chatInputSend").height().toString() + "px");
    $("div#chatViewPort").height($("div#chatUsersViewport").height().toString() + "px");
}

function FormatUsername(name,color) {
    var ret = "<span style='color:" + color + ";'>";
    ret = ret.concat(name + "</span>");
    return ret;
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
	var user = FormatUsername(evt.user.username,evt.user.color);
	chat.text = user.concat(evt.text + "<br />").concat(chat.text);
	$("div#chattext").html(chat.text);
    });


    chat.socket.on("receiveUsernameInfo", function(evt) {
	if(evt.success) {
	    $("span#usernameDisp").css("color","#" + evt.color)
		.html(evt.username);
	}
    });

    chat.socket.on("chatUserChange", function(evt) {
	var users = evt.users;
	var list = "";
	for(var i = 0; i < users.length; ++i) {
	    list = list.concat(FormatUsername(users[i].username,users[i].color);
	}
	$("div#chatUsers").html(list);
    });

    //chat stuff 

    $("button#chatInputSend").button().click(function(evt) {
	var txt = $($("#chatInput").val()).text();
	chat.socket.emit("chatSend", {text: txt});
	$("#chatInput").val("");
    });


    $("#chatInput").keydown(function(evt) {
	var code = evt.keyCode ? evt.keyCode : evt.which;
	if(code == 13 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) { //enter key
	    return false;
	}
	return true;
    })
	.keyup(function(evt) {
	    var code = evt.keyCode ? evt.keyCode : evt.which;
	    if(code == 13 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) { //enter key
		$("button#chatInputSend").trigger("click");
		return false;
	    }
	    return true;
	});


    //user div stuff
    $("span#usernameColor").ColorPicker({
	color: "#0000ff",
	onShow: function(cpicker) {
	    $(cpicker).fadeIn(200);
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
		    username: $($("input#usernameText").val()).text(),
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
