var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

var bodyParser = require('body-parser')

var request = require('request');

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())


var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;	
server.listen(port,ip);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket){
console.log('server is listening...');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

 socket.on('store', function(msg){
    console.log("TEST");
    console.log(process);
  });

});



app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            sendAIResponse(sender,text.substring(0, 200));
        }
    }
    res.sendStatus(200);
})




function sendAIResponse(sender, text) {
	    request({
        url: 'http://api.program-o.com/v2/chatbot',
        qs:{
        	bot_id:6,
        	say:text,
        	convo_id:'exampleusage_1231232',
        	format:'json'
        },
        method: 'GET',
    }, function(error, response, body) {
		result=JSON.parse(response.body)['botsay'];

if(result.search('Program-O')>0){
	 result = result.replace("Program-O", "Dinanath Thakur");
}


		sendTextMessage(sender,result);
    });
}









var token = "EAADRUfUP9TcBAJgZAxVLbyE4bBsXAEEk3sjjjCSIzFfUThiW56ZCPZCLsj9udvgspc7em32UZARdyj2zLESprDHDDfYtLxZCqmlZBQow4fiob0Y7mevMp3Lx2hQotaptypEHZCB1Uj05M3Yf4cnZBZAVGrZBpJb6iWtAiVKjS44owgZBAZDZD";

function sendTextMessage(sender, text) {
io.emit('response',text);
	
    messageData = {
        text:text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}