require('rootpath')();
var express = require('express'); // Get the module
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json')
var port = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

//routing
//app.use(express.static(__dirname + '/public'));

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});*/

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

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
  console.log('listening on port:' + port);
});