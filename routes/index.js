var express = require('express');
//var router = express.Router();
var router = require('express-promise-router')();
var level = require('level')(process.env.DBNAME || './tumin');
var db = require('level-promisify')(level);

var Protocol = require('../modules/protocol'),
    TX = require('../modules/tx'),
    Fabric = require('../modules/fabric');

router.use(function timeLog(req, res) {
    console.log('Time: ', Date.now());
    return Promise.resolve('next');
});

function requireAuth(req, res) {
    if (!req.session.user) {
        req.session.user = {views: 0};
        console.log('Creando sesion');
    }
    //return Promise.reject(new Error('algo'));
    return Promise.resolve('next');
}

function store(req, res, next) {
    return db.put('user', JSON.stringify(req.session.user))
        .then(function () {
            return Promise.resolve('next');
        })
        .catch(function (err) {
            return Promise.reject(err);
        });
}

function retrive(req, res) {
    return db.get('user')
        .then(function (value) {
            req.session.user = JSON.parse(value);
            return Promise.resolve('next');
        })
        .catch(function (err) {
            return Promise.reject(err);
        });
}

function work(req, res) {
    req.session.user.views++;
    return Promise.resolve('next');
}
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Tumin Web Wallet'});
});

router.get('/hi', function (req, res, next) {
    res.json({version: Protocol.version});
});

router.get('/tangles', function (req, res, next) {
    res.json({title: 'Express'});
});

router.get('/tx', function (req, res, next) {
    var tx=new TX();
    res.send(tx.toJSON());
});

router.get('/txb', function (req, res, next) {
    var tx = new TX();
    res.send(tx.toBIN());
});

router.get('/txs', function (req, res, next) {
    res.json({title: 'Express'});
});

router.get('/props', function (req, res, next) {
    res.send({title: 'Express'});
});

router.get('/url', retrive, requireAuth, work, store, function (req, res) {
    res.send({title: 'URL', s: req.session.id, user: req.session.user});
});
module.exports = router;
