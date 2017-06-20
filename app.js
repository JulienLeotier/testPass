var express = require('express');
var favicon = require('serve-favicon');
var http = require('http');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var bcrypt = require("bcrypt");
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var app = express();
app
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json());
mongoose.connect('mongodb://localhost/bdd');

//Création du shema
const userSchema = mongoose.Schema({
	username: String,
	password: String,
	_id: String,
}),
	Auth = mongoose.model("Auth", userSchema);
// 	route = express.Router();
// route
// 	.route("/:user_id")
// 	.put(function (req, res) {
// 		Auth.findOne({ _id: req.params.user_id }, function (err, user) {
// 			if (err) {
// 				res.send(err);
// 			}
// 			bcrypt.hash(req.body.password, 10, function (err, hash) {
// 				if (err) {
// 					res.send(err);
// 				}
// 				user.username = req.body.username;
// 				user.password = hash
// 				user._id = req.body._id;
// 				user.save(function (err) {
// 					if (err) {
// 						res.send(err);
// 					}
// 					res.send({ message: 'user updates' });
// 				});

// 			});
// 		});
// 	})
// //chemin
// app.use("/admin", route);

//==================================================================
// We use the strategy *local* of PassportJS
passport.use(new LocalStrategy(
	function (username, password, done) {
		// stupid example
		Auth.findOne({ _id: "admin" }, function (err, user) {
			if (err) {
				console.log(err)
			}
			bcrypt.compare(password, user.password).then(function (result) {
				if (username === user.username && result == true) {
					return done(null, { name: "admin" });
				}
				return done(null, false, { message: 'Incorrect username.' });
			})


		});
	}
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function (req, res, next) {
	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};
//==================================================================
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'alienoDevLogo.ico')));
app.use(logger('dev'));
app.use(session({
	secret: 'securedsession', // secret word to create the hash
	resave: false, // If true, it forces the session to be saved back to the session store
	saveUninitialized: false // If true, it forces a session that is "uninitialized" to be saved to the store
}));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//==================================================================
// routes
app.get('/', function (req, res) {
	res.render('index', { title: 'Express' });
});

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function (req, res) {
	res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function (req, res) {
	res.send(req.user);
});

// route to log out
app.post('/logout', function (req, res) {
	req.logOut();
	res.sendStatus(200);
});
//==================================================================

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
