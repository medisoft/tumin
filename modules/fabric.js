/**
 * Created by mario on 23/04/17.
 */
var _ = require('lodash'),
    varint = require('varint');
/*
var db = {
    genesis: require('level-promisify')(require('level')((process.env.DBNAME || './tumin') + '/genesis')),
    fabric: require('level-promisify')(require('level')((process.env.DBNAME || './tumin') + '/fabric'))
};
*/
var db = require('diskdb');
db.connect(process.env.DBNAME || './tumin',['genesis']),
db.connect(process.env.DBNAME || './tumin',['fabric']);


var types = require('./types');

function store(collection, key, data) {
    var tmp={};
    tmp[key]=data;
    db.genesis.save(tmp);
/*
    return db[collection].put(key, data)
        .then(function (res) {
            return Promise.resolve(res);
        })
        .catch(function (err) {
            return Promise.reject(err);
        });
*/
}

function retrive(collection, key) {
/*
    return db[collection].get(key)
        .then(function (value) {
            return Promise.resolve(value);
        })
        .catch(function (err) {
            return Promise.reject(err);
        });
*/
}


function Fabric() {
}
Fabric.prototype.attach = function (tx) {
    // Validates the transaction
    if (!tx.isValid()) return false;
    // Checks if it is a genesis, if not, then check if their VTXS exists
    if (tx.isGenesis()) {
        // If it as genesis transaction, inserts the txid into genesis collection
        store('genesis',tx.get().txid,new Date().getTime());
/*
        return store('genesis', tx.get().txid)
            .then(function (res) {
                console.log('Insertado en genesis');
            })
            .catch(function (err) {
                console.error(err);
            })
*/
    }
    // If everything is OK, inserts in fabric collection
    // Inserts the txid into genesis relations collection (named as txid of the genesis)
    // this.fabric.txs[tx.get().txid] = tx;
    return true;
}
Fabric.prototype.gettx = function (txid) {
    return false;
}

Fabric.prototype.status = function () {
    return retrive('genesis','*')
        .then(function (data) {
            console.log('trae', data);
            return data;
        })
        .catch(function (err) {
            console.error(err);
            return false;
        })
}
module.exports = Fabric;
