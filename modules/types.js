/**
 * Created by mario on 25/04/17.
 */
var Type = require('../lib/js-binary').Type;
var bignum = require('bignum');

const GENESIS = 0x00;
const SPAM = 0x01;
const MINT = 0x02;
const BET = 0x03;
const MINTCLAIM = 0x04;
const TRANSFER = 0x05;
const SMART = 0x06;
const HFT = 0x07;
module.exports.GENESIS = GENESIS;
module.exports.SPAM = SPAM;
module.exports.MINT = MINT;
module.exports.BET = BET;
module.exports.MINTCLAIM = MINTCLAIM;
module.exports.TRANSFER = TRANSFER;
module.exports.SMART = SMART;
module.exports.HFT = HFT;

module.exports.TimePerBlock = 10000; // 10 seconds in miliseconds
module.exports.RewardDivisor = 25;
module.exports.SupplyMultiplier = 53;
module.exports.MSupply = bignum.pow(2, module.exports.SupplyMultiplier).sub(1);
module.exports.NumBlocks = bignum.pow(2, module.exports.SupplyMultiplier - module.exports.RewardDivisor);

module.exports.MAX = bignum('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
module.exports.MIN = bignum('0000000000000000000000000000000000000000000000000000000000000000', 16);
module.exports.VTXS_COUNT = 2;

module.exports.LONG_PERIOD = 86400 * 1000; // One day
module.exports.SHORT_PERIOD = 3600 * 1000; // One hour
module.exports.MINIMUM_TXPERBLOCK = 1;

const F_GENESIS = 0;
const F_SPAM = 1;
const FEATURES = [F_GENESIS, F_SPAM];
const INTTYPE = 'uint';
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
const features = [INTTYPE];
const tx = {
    txid: 'hex', // sha256 of txdata
    features: features,
    txdata: txdata,
    'vtxs?': vtxs, // txid of the two transactions that validates
    'hash?': 'hex', // sha256 of txid plus ids in vtxs
    'sign?': 'hex' // signature of the hash by all the required keys
};
const txdataSchema = new Type(txdata);
const vtxsSchema = new Type(vtxs);
const txSchema = new Type(tx);
const featuresSchema = new Type(features);


module.exports.txdataSchema = txdataSchema;
module.exports.vtxsSchema = vtxsSchema;
module.exports.txSchema = txSchema;
module.exports.featuresSchema = featuresSchema;