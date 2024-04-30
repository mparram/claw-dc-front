var socket = io();
var host_name = document.location.hostname;
var countdownInterval;
var validkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space"];
if (navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i) 
                || navigator.userAgent.match(/iPad/i) 
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Windows Phone/i)) {
                document.getElementById("joyDiv").style.top = "82%";
            } else {
}
console.log("connecting to host: ", host_name);
socket.on("video_uri", (uri) => {
    console.log("video_uri: " + uri);
    var mycanvas = document.getElementById("video-canvas");
    var player = new JSMpeg.Player(uri, {canvas: mycanvas});
});

socket.on("playlist", (data) => {
    //const playlist = data.split(',');
    console.log("tlist: " + data);
    var t = "";
    for (var i = 0; i < data.length; i++){
    var tr = "<tr>";
    if(data[i] != "---") {
        tr += "<td>"+ i +"</td>";
    } else{
        tr += "<td>&nbsp</td>";
    }
    tr += "<td>"+data[i]+"</td>";
    tr += "</tr>";
    t += tr;
    }
    console.log("tr: " + tr);
    document.getElementById("playertable").innerHTML = t;
});
var currentplayer = false;
socket.on("currentplayer", (data) => {
    if (data){
        startcountdown();
    }
})
socket.on("valid_user", (data) => {
    if (data.valid === false){
        alert(data.reason);
        document.getElementById("usernamecard").usernamecard.style.visibility = "visible";
    }
})

function toggledisplay() {
    var clawcam = document.getElementById("clawcam");
    var usernamecard = document.getElementById("usernamecard");
    var username = document.getElementById("username").value;
    
    if (username.length < 3){
        window.alert("too short username");
    } else {
        console.log("username: " + username);
        usernamecard.style.visibility = "hidden";
        socket.emit('validateusr', username);
    }

  }
var initial = true;
var played = false;
document["ArrowUp"] = false;
document["ArrowDown"] = false;
document["ArrowLeft"] = false;
document["ArrowRight"] = false;
document.addEventListener('keydown', (event) => {
    var code = event.code;
    console.log("Keydown: " + code);
    if ((currentplayer) &&(validkeys.indexOf(code) > -1 )) {
        console.log("Dcode: " + code + " document[code]: " + document[code]);
        if (code === "Space"){
            launchClaw();
        } else if (document[code] === false) {
            document[code] = true;
            socket.emit("control", code, "down");
            console.log("DScode: " + code + " document[code]: " + document[code]);
        }
    }
}, false);

document.addEventListener('keyup', (event) => {
    var code = event.code;
    console.log("Keyup: " + code);
    if ((currentplayer) &&(validkeys.indexOf(code) > -1 )) {
        console.log("Ucode: " + code + " document[code]: " + document[code]);
        if (document[code] === true) {
            document[code] = false;
            socket.emit("control", code, "up");
            console.log("UScode: " + code + " document[code]: " + document[code]);
        }
    }
}, false);

function launchClaw(){
    currentplayer = false;
    clearInterval(countdownInterval);
    socket.emit("control", "Space", "down");
    currentplayer = false;
    document.getElementById("launch").disabled = true;
    document.getElementById("countdown").style.visibility = "hidden";
    setTimeout(() => {
        document.getElementById("usernamecard").style.visibility = "visible";
    }, 7000);
}


function startcountdown() {
    console.log("startcountdown");
    var countdown = 3;
    document.getElementById("countdown").style.left= "45%";
    document.getElementById("countdown").style.top= "20%";
    document.getElementById("countdown").innerHTML = "Ready...";
    document.getElementById("countdown").style.visibility = "visible";

    var joystickCatch = setInterval(function(){ 
        
        if (currentplayer == true) {
            played = true;
            var direction=joy.GetDir();
            if ((["N","NW","NE"].includes(direction)) && (document["ArrowUp"] === false)) {
                console.log("JArrowUp: " + ArrowUp + " document['ArrowUp']: " + document["ArrowUp"]);
                document["ArrowUp"] = true;
                socket.emit("control", "ArrowUp", "down");
                if (document["ArrowDown"] == true){
                    document["ArrowDown"] = false;
                    socket.emit("control", "ArrowDown", "up");
                }
                console.log("Up");
            } else if ((["S","SW","SE"].includes(direction)) && (document["ArrowDown"] === false)) {
                document["ArrowDown"] = true;
                socket.emit("control", "ArrowDown", "down");
                if (document["ArrowUp"] == true){
                    document["ArrowUp"] = false;
                    socket.emit("control", "ArrowUp", "up");
                }
                console.log("Down");
            }
            if ((["E","NE","SE"].includes(direction)) && (document["ArrowRight"] === false)) {
                document["ArrowRight"] = true;
                socket.emit("control", "ArrowRight", "down");
                if (document["ArrowLeft"] == true){
                    document["ArrowLeft"] = false;
                    socket.emit("control", "ArrowLeft", "up");
                }
                console.log("Right");
            } else if ((["W","NW","SW"].includes(direction)) && (document["ArrowLeft"] === false)) {
                document["ArrowLeft"] = true;
                socket.emit("control", "ArrowLeft", "down");
                if (document["ArrowRight"] == true){
                    document["ArrowRight"] = false;
                    socket.emit("control", "ArrowRight", "up");
                }
                console.log("Left");
            } else if (direction == "C"){
                if (document["ArrowUp"] == true){
                    document["ArrowUp"] = false;
                    socket.emit("control", "ArrowUp", "up");
                }
                if (document["ArrowDown"] == true){
                    document["ArrowDown"] = false;
                    socket.emit("control", "ArrowDown", "up");
                }
                if (document["ArrowLeft"] == true){
                    document["ArrowLeft"] = false;
                    socket.emit("control", "ArrowLeft", "up");
                }
                if (document["ArrowRight"] == true){
                    document["ArrowRight"] = false;
                    socket.emit("control", "ArrowRight", "up");
                }
            }
        } else if ((currentplayer ==false ) && (played == true)) {
            clearInterval(joystickCatch);
        }
    }, 20);
    countdownInterval = setInterval(function() {
        console.log("countdown: " + countdown);
        if ((countdown === -1) && (initial === true)) {
            currentplayer = true;
            countdown -= 1;
            document.getElementById("countdown").innerHTML = "GO!";
            document.getElementById("launch").disabled = false;
        }else if ((countdown < -1) && (initial === true)) {
            countdown = 18;
            initial = false;
            document.getElementById("countdown").innerHTML = "GO!";
        } else if ((countdown < 0) && (initial === false)) {
            launchClaw();
            
        } else  if (initial === true){

            document.getElementById("countdown").innerHTML = "Start in: " + countdown;
            countdown -= 1;
        }else{
            document.getElementById("countdown").style.left= "5%";
            document.getElementById("countdown").style.top= "12%";
            document.getElementById("countdown").innerHTML = "Time left: " + countdown;
            countdown -= 1;
        }
    }, 1000);
}
var joy = new JoyStick('joyDiv');
