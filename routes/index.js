var express = require('express');
//var router = express.Router();
var router = require('express-promise-router')();
var level = require('level')('./tumin');
var db = require('level-promisify')(level);

router.use(function timeLog(req, res) {
  console.log('Time: ', Date.now());
  return Promise.resolve('next');
});

function requireAuth(req,res) {
	 if (!req.session.user) {
		 req.session.user={views:0};
		 console.log('Creando sesion');
	 }
	//return Promise.reject(new Error('algo'));
	return Promise.resolve('next');
}

function store(req, res, next) {
	return db.put('user', JSON.stringify(req.session.user))
		.then(function() {
			return Promise.resolve('next');
		})
		.catch(function(err) {
			return Promise.reject(err);
		});
}

function retrive(req, res) {
	return db.get('user')
		.then(function(value) {
			req.session.user=JSON.parse(value);
			return Promise.resolve('next');
		})
		.catch(function(err) {
			return Promise.reject(err);
		});
}

function work(req, res) {
	req.session.user.views++;
	return Promise.resolve('next');
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tumin Web Wallet' });
});

router.get('/hello', function(req, res, next) {
  res.send({ title: 'Express' });
});

router.get('/props', function(req, res, next) {
  res.send({ title: 'Express' });
});

router.get('/url', retrive, requireAuth, work, store, function (req, res) {
    res.send({ title: 'URL', s: req.session.id, user: req.session.user });
});
module.exports = router;
