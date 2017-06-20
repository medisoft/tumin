/**
 * Created by mario on 23/04/17.
 */
var sha256 = require('crypto-js/sha256');
var sha384 = require('crypto-js/sha384');
var sha512 = require('crypto-js/sha512');
var _ = require('lodash');
var Type = require('../lib/js-binary').Type;
var bignum = require('bignum'),
    numeral = require('numeral'),
    types = require('./types');



const GENESIS = 0x00;
const SPAM = 0x01;
const MINT = 0x02;
const BET = 0x03;
const MINTCLAIM = 0x04;
const TRANSFER = 0x05;
const SMART = 0x06;
const HFT = 0x07;

const F_GENESIS = 0;
const F_SPAM = 1;
const FEATURES = [F_GENESIS, F_SPAM];
const INTTYPE = 'uint';
const txdata = {
    type: INTTYPE,
    createdAt: INTTYPE,
    'nonce?': INTTYPE,
    'amount?': INTTYPE,
    'in?': ['hex'],
    'out?': ['hex'],
    'bet?': 'hex',
    'betKey?': 'hex'
};
const vtxs = ['hex'];
const tx = {
    txid: 'hex', // sha256 of txdata
    features: [INTTYPE],
    txdata: txdata,
    'vtxs?': vtxs, // txid of the two transactions that validates
    'hash?': 'hex', // sha256 of txid plus ids in vtxs
    'sign?': 'hex' // signature of the hash by all the required keys
};

const txdataSchema = new Type(txdata);
const vtxsSchema = new Type(vtxs);
const txSchema = new Type(tx);
const EMPTY_TRANSACTION = {
    txid: null,
    features: FEATURES,
    txdata: {
        type: GENESIS,
        // createdAt: new Date('2017-05-15 00:00:00').getTime()
    },
    vtxs: [],
    hash: null
};
function TX(tx = EMPTY_TRANSACTION) {
    this.tx = tx;
    this.updateTX();
    return this;
}
TX.prototype.updateTX = function () {
    if(!this.tx.txdata.createdAt) this.tx.txdata.createdAt = new Date().getTime();
    var txid = txdataSchema.encode(this.tx.txdata).toString('binary');
    var vtxs = vtxsSchema.encode(this.tx.vtxs).toString('binary');
    this.tx.txid = sha256(txid).toString()
    this.tx.hash = sha256(txid.concat(vtxs)).toString();
}
TX.prototype.get = function () {
    this.updateTX();
    return this.tx;
}
TX.prototype.toBIN = function () {
    // this.tx.vtxs.push(sha256('1').toString())
    // this.tx.vtxs.push(sha256('2').toString())
    this.updateTX();
    // return txSchema.decode(Buffer.from(txSchema.encode(this.tx).toString('binary'),'binary'));
    return txSchema.encode(this.tx).toString('binary');
}

TX.prototype.toJSON = function () {
    this.tx.vtxs.push(sha256('1').toString())
    this.tx.vtxs.push(sha256('2').toString())
    this.updateTX();
    return JSON.stringify(this.tx);
}

TX.prototype.setType = function (type) {
    this.tx.txdata.type = type;
    this.updateTX();
}

TX.prototype.setNonce = function (nonce) {
    this.tx.txdata.nonce = nonce;
    this.updateTX();
}

TX.prototype.setVTX = function (vtx) {
    this.tx.vtxs.push(new Buffer(vtx, 'hex'));
}
TX.prototype.isValid = function () {
    return true;
};
TX.prototype.isGenesis = function () {
    return this.tx.txdata.type == GENESIS;
};

TX.prototype.validate = function (vtxs, difficulty) {
    let self=this;
    let _vtxs;
    let tini=new Date().getTime(), i=0;
    let tend=tini+types.SHORT_PERIOD;
    do {
        i++;
        _vtxs=[];
        // Calculate new nonce and update the transaction
        this.setNonce(parseInt(Math.random() * Math.pow(10, 15)));
        var txid = bignum(self.tx.txid, 16);

        // Calculate range
        var rl = txid.sub(types.MIN).div(difficulty);
        var rh = types.MAX.sub(txid).div(difficulty);
        // console.log('nonce', self.tx.txdata.nonce, 'rl', rl, 'rh', rh)

        // Find a pair of vtxs within the range
        _.each(vtxs, function (v, k) {
            if (_vtxs.length == types.VTXS_COUNT) {
                self.tx.vtxs = _vtxs;
                return true;
            }
            var vtxid = bignum(v.txid, 16);
            // console.log(vtxid);
            if (vtxid.ge(rl) && vtxid.le(rh)) {
                // console.log(`vtxid ${_vtxs.length+1}`, v.txid)
                _vtxs.push(v.txid);
            }
        })
        if(new Date().getTime()-tini>types.TimePerBlock) {
            tini=new Date().getTime();
            console.log(`${new Date()}: Didn't found VTXS after ${i} tries`);
        }
    // } while(_vtxs.length<types.VTXS_COUNT);
    } while(_vtxs.length<types.VTXS_COUNT && new Date().getTime()<tend);
    // If found, add to the tx and return true, if not, return false
    if(_vtxs.length==types.VTXS_COUNT) {
        self.tx.vtxs=_vtxs;
        // console.log(`Encontro ${_vtxs} en ${i} intentos`);
        console.log(`${new Date()}: Did ${i} tries to find VTXS`);
        return true;
    }
    console.log(`${new Date()}: There was an error. Didn't found VTXS after ${i} tries`);
    return false;
}
module.exports = TX;
