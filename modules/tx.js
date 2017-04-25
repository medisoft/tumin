/**
 * Created by mario on 23/04/17.
 */
var sha256 = require('crypto-js/sha256');
var sha384 = require('crypto-js/sha384');
var sha512 = require('crypto-js/sha512');
var varint = require('varint'),
    _ = require('lodash');
var Type = require('../lib/js-binary').Type;

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
const INTTYPE='uint';
const txdata = {
    type: INTTYPE,
    timestamp: INTTYPE,
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

function TX() {
    this.tx = {
        txid: null,
        features: FEATURES,
        txdata: {
            type: GENESIS,
            timestamp: new Date().getTime(),
            amount: 121983574
        },
        vtxs: [],
        hash: null
    };
}
TX.prototype.updateTX = function () {
    this.tx.txdata.timestamp = new Date('2017-05-15 00:00:00').getTime();
    var txid = txdataSchema.encode(this.tx.txdata).toString('binary');
    var vtxs = vtxsSchema.encode(this.tx.vtxs).toString('binary');
    this.tx.txid = sha256(txid).toString()
    this.tx.hash = sha256(txid.concat(vtxs)).toString();
}
TX.prototype.toBIN = function () {
    this.tx.vtxs.push(sha256('1').toString())
    this.tx.vtxs.push(sha256('2').toString())
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
}
TX.prototype.setVTX = function (vtx) {
    this.tx.vtxs.push(new Buffer(vtx, 'hex'));
}

module.exports = TX;
