/**
 * Created by mario on 25/04/17.
 */
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