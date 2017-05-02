/**
 * Created by mario on 23/04/17.
 */
var _ = require('lodash'),
    varint = require('varint'),
    Q = require('q'),
    TX = require('./tx');

var Datastore = require('nedb'), path = require('path'), db = {
    genesis: new Datastore({filename: path.join('tumin', 'genesis.db'), autoload: true}),
    fabric: new Datastore({filename: path.join('tumin', 'fabric.db'), autoload: true}),
    mempool: new Datastore({filename: path.join('tumin', 'mempool.db'), autoload: true})
};

var types = require('./types');

function store(collection, data) {
    var deferred = Q.defer();

    if (!db[collection]) db[collection] = new Datastore({
        filename: path.join('tumin', collection + '.db'),
        autoload: true
    });

    db[collection].insert(data, function (err, result) {
        if (err) return deferred.reject(err);
        return deferred.resolve(result);
    });

    return deferred.promise;
}
function update(collection, query, data) {
    var deferred = Q.defer();

    if (!db[collection]) db[collection] = new Datastore({
        filename: path.join('tumin', collection + '.db'),
        autoload: true
    });
    // db.update({ system: 'solar' }, { $set: { system: 'solar system' } }, { multi: true }, function (err, numReplaced) {
        // numReplaced = 3
        // Field 'system' on Mars, Earth, Jupiter now has value 'solar system'
    // });

    db[collection].update(query, data, {upsert: true, multi: true}, function (err, numUpdated, result) {
        if (err) return deferred.reject(err);
        console.log('Num Updated',numUpdated,'for ',query);
        return deferred.resolve(result);
    });

    return deferred.promise;
}

function retrive(collection, key) {
    var deferred = Q.defer();
    if (!db[collection]) db[collection] = new Datastore({
        filename: path.join('tumin', collection + '.db'),
        autoload: true
    });

    db[collection].find(key, function (err, result) {
        if (err) return deferred.reject(err);
        return deferred.resolve(result);
    })
    return deferred.promise;

}

function count(collection, query) {
    var deferred = Q.defer();
    if (!db[collection]) db[collection] = new Datastore({
        filename: path.join('tumin', collection + '.db'),
        autoload: true
    });
    db[collection].count(query, function (err, result) {
        if (err) return deferred.reject(err);
        return deferred.resolve(result);
    })
    return deferred.promise;
}

function Fabric() {
}

Fabric.prototype.attach = function (tx) {
    var receivedAt = new Date().getTime();
    var txobj;
    // Validates the transaction
    if (!tx.isValid()) return false;
    txobj = tx.get();
    txobj.receivedAt = receivedAt;
    // Checks if it is a genesis, if not, then check if their VTXS exists
    if (tx.isGenesis()) {
        // If it as genesis transaction, inserts the txid into genesis collection
        return store('genesis', {txid: txobj.txid, receivedAt})
            .then(function (res) {
                // console.log('Attached to genesis list', res);
                // If everything is OK, inserts in fabric collection
                return store('fabric', txobj);
            })
            .then(function (res) {
                // console.log('Attached to genesis list', res);
                // If everything is OK, inserts in fabric collection
                return store('mempool', {txid:txobj.txid,links:0});
            })
            .then(function(mempool) {
                return update('mempool',{txid: {$in:txobj.vtxs}},{$inc:{links:1}});
            })
            .then(function (res) {
                // console.log('Attached to fabric', res);
                // Inserts the txid into genesis relations collection (named as txid of the genesis)
                return store(txobj.txid, {txid: txobj.txid, receivedAt})
            })
            .then(function (res) {
                // console.log('Attached to relations collection', res)
                return store('genesislink', {txid: txobj.txid, genesisid: txobj.txid})
            })
            .then(function (res) {
                // console.log('Attached to genesis link', res)
                return true;
            })
            .catch(function (err) {
                console.error(err);
                return false;
            });
    } else {
        let _genesis;
        // Find the genesis txid of this transaction. It should have one per vtxs, and then
        return retrive('genesislink', {txid: {$in: txobj.vtxs}})
            .then(function (genesis) {
                // Inserts in genesis link collection
                let tmp = [];
                if (genesis.length < types.VTXS_COUNT) throw new Error('The VTXS are not linked with any genesis on this node');
                genesis=_.uniqBy(genesis,'genesisid');
                // genesis=_.uniqBy(genesis,'txid');
                console.log(`Related genesis for ${txobj.txid} are `,_.map(genesis,function(v) { return `${v.genesisid}`}));
                _genesis=genesis;
                _.each(genesis, function (v, k) {
                    tmp.push({txid: txobj.txid, genesisid: v.genesisid});
                });
                return store('genesislink', tmp);
            })
            .then(function (linked) {
                // Inserts in fabric collection
                // console.log('Linked results ', linked);
                return store('fabric', txobj);
            })
            .then(function (res) {
                // console.log('Attached to genesis list', res);
                // If everything is OK, inserts in fabric collection
                return store('mempool', {txid:txobj.txid,links:0});
            })
            .then(function(mempool) {
                return update('mempool',{txid: {$in:txobj.vtxs}},{$inc:{links:1}});
            })
            .then(function (res) {
                // console.log('Attached to fabric', res);
                // Inserts the txid into genesis relations collections (named as txid of the genesis)
                _.each(_genesis, function(v,k) {
                    store(v.genesisid, {txid: txobj.txid, receivedAt});
                });
                return true;
            })
            .catch(function (err) {
                console.error(err);
                return false;
            });
    }
    return true;
}
Fabric.prototype.gettx = function (txid) {
    return retrive('fabric', {txid: txid})
        .then(function (res) {
            return res;
        })
        .catch(function (err) {
            return err;
        })
}

Fabric.prototype.status = function () {
    return retrive('fabric', '')
        .then(function (fabric) {
            return fabric;
        })
        .catch(function (err) {
            return err;
        });
}

Fabric.prototype.genesis = function () {
    return retrive('genesis', '')
        .then(function (genesis) {
            return genesis;
        })
        .catch(function (err) {
            return err;
        });
}

Fabric.prototype.averageTransactions = function () {
    return count('fabric', {receivedAt: {$gte: new Date().getTime() - 86400 * 1000}})
        .then(function (res) {
            console.log('Total', res);
            return Math.ceil(res / 8640) <= 0 ? 1 : Math.ceil(res / (86400 * 1000 / types.TimePerBlock));
        })
        .catch(function (err) {
            return err;
        })
}
Fabric.prototype.lastTransactionCount = function () {
    return count('fabric', {receivedAt: {$gte: new Date().getTime() - types.TimePerBlock}})
        .then(function (res) {
            return res;
        })
        .catch(function (err) {
            return err;
        })
}


Fabric.prototype.generateSPAM = function () {
    let self = this;
    let _avg, _last, _tx;
    self.averageTransactions()
        .then(function (avg) {
            _avg = avg;
            return self.lastTransactionCount();
        })
        .then(function (last) {
            _last = last;
            console.log(`Ultimos ${_last} vs Promedio ${_avg}`);
            if (_last < _avg) {
                return retrive('mempool', '');
            }
            return;
        })
        .then(function (vtxs) {
            if (!vtxs) return;
            if (vtxs.length < 2) {
                console.error('Not enough transactions in fabric');
                return false;
            }
            console.log('Creating a new SPAM transaction');
            _tx = new TX();
            _tx.setType(types.SPAM);
            if (_tx.validate(vtxs, _avg)) {
                console.log('TX validated', _tx.get())
                self.attach(_tx);
            }
        })
        .catch(function (err) {
            console.error(err);
            return err;
        });
}

module.exports = Fabric;
