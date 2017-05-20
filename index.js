var express = require('express'); // Get the module
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//routing
app.use(express.static(__dirname + '/public'));

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});*/


var numberOfUsers = 0;

io.on('connection', function(socket){
    var newUser = false;
    
    socket.on('chat message', function(msg) {
        socket.broadcast.emit('chat message', {
            username: socket.username,
            message: msg
        });
    });
    
    socket.on('add new user', function (username) {
        if (newUser) return;

        
        socket.username = username;
        ++numberOfUsers;
        newUser = true;
        socket.emit('login', {
           numberOfUsers: numberOfUsers 
        });
        
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numberOfUsers: numberOfUsers
        });
    });
    
    socket.on('typing', function () {
       socket.broadcast.emit('typing', {
           username: socket.username
       }); 
    });
    
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
              username: socket.username
        });          
    });

    socket.on('disconnect', function () {
        if (newUser) {
            --numberOfUsers;
            
            socket.broadcast.emit('user left', {
                username: socket.username,
                numberOfUsers: numberOfUsers
            });
        }
    });
});
    
//server listens to port
http.listen(port, function(){
  console.log('listening on %d:' + port);
});