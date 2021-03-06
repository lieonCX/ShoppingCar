var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var index = require('./routes/index');
var user = require('./routes/user');
var expresshbs = require('express-handlebars');
// var productSeed = require('./seed/productSeeder');
var app = express();
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
require('./config/passport');

mongoose.connect('localhost:27017/shopping');
// view engine setup
app.engine('.hbs', expresshbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validator());
// 将session存储在mongod数据库中
app.use(session({
    secret: 'meysecret',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
app.use(function(req, res, next) {
    res.locals.logger = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});
app.use('/', index);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;