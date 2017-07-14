/**
 * Created by mario on 23/04/17.
 */
var _ = require('lodash'),
    varint = require('varint'),
    Q = require('q'),
    TX = require('./tx'),
    mongoose = require('mongoose'), Schema=mongoose.Schema;

mongoose.connect('mongodb://localhost/tumin');




var Datastore = require('nedb'), path = require('path'), db = {
    genesis: new Datastore({filename: path.join('tumin', 'genesis.db'), autoload: true}),
    fabric: new Datastore({filename: path.join('tumin', 'fabric.db'), autoload: true}),
    mempool: new Datastore({filename: path.join('tumin', 'mempool.db'), autoload: true})
};

db.mempool.ensureIndex({fieldName: 'links'})
db.fabric.ensureIndex({fieldName: 'receivedAt'})
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
        // console.log('Num Updated', numUpdated, 'for ', query);
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

function remove(collection, key) {
    var deferred = Q.defer();
    if (!db[collection]) db[collection] = new Datastore({
        filename: path.join('tumin', collection + '.db'),
        autoload: true
    });

    db[collection].remove(key, {multi: true}, function (err, result) {
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
                return store('mempool', {txid: txobj.txid, links: 0});
            })
            .then(function (mempool) {
                if (txobj.vtxs.length > 0)
                    return update('mempool', {txid: {$in: txobj.vtxs}}, {$inc: {links: 1}});
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
                genesis = _.uniqBy(genesis, 'genesisid');
                // genesis=_.uniqBy(genesis,'txid');
                /*
                 console.log(`Related genesis for ${txobj.txid} are `, _.map(genesis, function (v) {
                 return `${v.genesisid}`
                 }));
                 */
                _genesis = genesis;
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
                return store('mempool', {txid: txobj.txid, links: 0});
            })
            .then(function (mempool) {
                if (txobj.vtxs.length > 0)
                    return update('mempool', {txid: {$in: txobj.vtxs}}, {$inc: {links: 1}});
            })
            .then(function (res) {
                // console.log('Attached to fabric', res);
                // Inserts the txid into genesis relations collections (named as txid of the genesis)
                _.each(_genesis, function (v, k) {
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
    return count('fabric', {receivedAt: {$gte: new Date().getTime() - types.LONG_PERIOD}})
        .then(function (res) {
            return res / (types.LONG_PERIOD / types.TimePerBlock);
            // return Math.ceil(res / (types.LONG_PERIOD/1000)) <= 0 ? 1 : Math.ceil(res / (types.LONG_PERIOD / types.TimePerBlock));
        })
        .catch(function (err) {
            return err;
        })
}
Fabric.prototype.averageTransactionsShort = function () {
    return count('fabric', {receivedAt: {$gte: new Date().getTime() - types.SHORT_PERIOD}})
        .then(function (res) {
            return res / (types.SHORT_PERIOD / types.TimePerBlock);
            // return Math.ceil(res / (types.LONG_PERIOD/1000)) <= 0 ? 1 : Math.ceil(res / (types.LONG_PERIOD / types.TimePerBlock));
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
    let _avg, _short, _last, _tx;
    let difficulty;
    remove('mempool', {'links': {$gte: 7}})
        .then(self.averageTransactions)
        .then(function (avg) {
            _avg = avg;
            return self.averageTransactionsShort();
        })
        .then(function (avg) {
            _short = avg;
            return self.lastTransactionCount();
        })
        .then(function (last) {
            _last = last;
            // console.log(`Latest Count ${_last} vs Long Average ${_avg} and Short Average ${_short} MIN ${types.MINIMUM_TXPERBLOCK} per block`);
            if (_short < _avg || (_avg < types.MINIMUM_TXPERBLOCK && _short < types.MINIMUM_TXPERBLOCK) || true) {
                return retrive('mempool', {'links': {$lt: 7}});
            }
            setTimeout(function () {
                self.generateSPAM()
            }, types.TimePerBlock);
            return null;
        })
        .then(function (vtxs) {
            if (!vtxs) return;
            if (vtxs.length < 2) {
                console.error('Not enough transactions in fabric');
                return self.generateSPAM(false);
            }
            // vtxs = _.shuffle(vtxs);
            vtxs = _.sortBy(vtxs, 'links').reverse();
            // difficulty = _short / Math.max(_avg, types.MINIMUM_TXPERBLOCK) * types.TimePerBlock / 1000;
            // difficulty = _short / (_avg<=0?1:_avg); //Math.max(_avg, types.MINIMUM_TXPERBLOCK) * types.TimePerBlock / 1000;
            // difficulty = Math.max(0.5,_short) / Math.max(1,(_avg<=0?1:_avg)); //Math.max(_avg, types.MINIMUM_TXPERBLOCK) * types.TimePerBlock / 1000;
            difficulty = Math.max(1, _short) / Math.max(types.MINIMUM_TXPERBLOCK, (_avg <= 0 ? 1 : _avg)); //Math.max(_avg, types.MINIMUM_TXPERBLOCK) * types.TimePerBlock / 1000;
            if (difficulty <= 0) difficulty = 1;
            if (difficulty > 1) difficulty = Math.exp(difficulty);
            console.log(`${new Date()}: Creating a new SPAM transaction from ${vtxs.length} pool with difficulty of ${difficulty} with Short ${_short} and Long ${_avg}`);
            _tx = new TX();
            _tx.setType(types.SPAM);
            if (_tx.validate(vtxs, difficulty)) {
                self.attach(_tx);
                return self.generateSPAM();
            } else return self.generateSPAM(false);
        })
        .catch(function (err) {
            console.error(err);
            return self.generateSPAM(err);
        });
}

module.exports = Fabric;
