/**
 * Created by mario on 23/04/17.
 */
var _ = require('lodash'),
    varint = require('varint');
var db = require('diskdb');
db.connect(process.env.DBNAME || './tumin',['genesis','fabric']);

var types = require('./types');

function store(collection, data) {
    return db[collection].save(data);
}

function retrive(collection, key) {
    return db[collection].find(key)
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
    return retrive('genesis','');
}
module.exports = Fabric;
