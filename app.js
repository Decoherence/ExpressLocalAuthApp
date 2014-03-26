
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

// connect to local database
mongoose.connect('mongodb://localhost/UserDatabase');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  username: String,
  password: String
}, {
  collection: 'userInfo'
});
var UserModel = mongoose.model('userInfo', UserSchema); 

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());  // Passport middleware for auth
app.use(passport.session());  // Passport middleware for auth
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login', function(req, res) {
  res.render('login');
});

// login handler routes
app.post('/login', 
 passport.authenticate('local', {
   successRedirect: '/loginSuccess', 
   failureRedirect: '/loginFailure'
 })
);

app.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});

app.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
});

// passport serialize and deserialize the user instance
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// define local authentication strategy
passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    // auth check logic
    UserModel.findOne({
      'username': username,
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
