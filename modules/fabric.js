/**
 * Created by mario on 23/04/17.
 */
var _ = require('lodash'),
    varint = require('varint');
function Fabric() {
    this.fabric = {
        features: [1,2],
        txs: {}
    };
}
Fabric.prototype.validate = function (tx) {
    return true;
};
Fabric.prototype.attach = function (tx) {
    this.fabric.txs[tx.get().txid] = tx;
    return true;
}

Fabric.prototype.toJSON = function () {
    console.log(this.fabric);
    return JSON.stringify(this.fabric);
}
Fabric.prototype.toBIN = function () {
    var ret;
    _.each(this.fabric.features, function(v,k) {
        if(!ret) ret=new Buffer(varint.encode(v));
        else ret=Buffer.concat([ret,new Buffer(varint.encode(v))]);
    })
    _.each(this.fabric.txs, function(v,k) {
        if(!ret) ret=new Buffer(v.toBIN());
        else ret=Buffer.concat([ret,new Buffer(v.toBIN())]);
    })
    return ret;
}
module.exports = Fabric;
