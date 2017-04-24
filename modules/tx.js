/**
 * Created by mario on 23/04/17.
 */
var sha256 = require('crypto-js/sha256');
var sha384 = require('crypto-js/sha384');
var sha512 = require('crypto-js/sha512');
var varint = require('varint');
var Type = require('js-binary').Type;

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

var txSchema = new Type({
    txid: 'Buffer',
    features: ['uint'],
    txdata: {
        type: 'uint',
        timestamp: 'Buffer',
        'nonce?': 'Buffer',
        'amount?': 'Buffer',
        'in?': ['Buffer'],
        'out?': ['Buffer'],
        'bet?': 'Buffer',
        'betKey?': 'Buffer'
    },
    validatetxs: ['Buffer'],
    hash: 'Buffer',
    'signature?': 'Buffer'
});

module.exports = {
    tx: {
        txid: undefined, // sha256 Of TXData
        features: undefined,
        txdata: {
            type: GENESIS,
            timestamp: new Date().getTime(),
        },
        validatestxs: [
            sha256('1').toString(),
            sha256('2').toString(),
        ],
        hash: undefined, // sha256OfEverythingExceptTheHashAndSignature"
        signature: undefined // signatureOfTXData_by_all_the_required_keys
    },
    toJSON: function () {
        this.tx.txdata.timestamp = new Date().getTime();
        this.tx.txdata.nonce = Math.random() * Math.pow(10, 18);
        this.tx.txid = sha256(this.tx.txdata).toString();
        this.tx.hash = sha256(this.tx.txid + this.tx.validatestxs).toString();
        this.tx.normal = 0x12401;
        this.tx.encoded = varint.encode(this.tx.normal);
        this.tx.decoded = varint.decode(this.tx.encoded);
        return JSON.stringify(this.tx);
    }
    ,
    toBIN: function () {
        this.tx.txdata.timestamp = new Buffer(varint.encode(new Date().getTime()));
        this.tx.txdata.nonce = new Buffer(varint.encode(Math.random() * Math.pow(10, 18)));
        this.tx.txdata.amount = new Buffer(varint.encode(85874763245));
        this.tx.features = [F_GENESIS, F_SPAM];
        this.tx.txid = new Buffer(sha256(this.tx.txdata).toString(), 'hex');
        this.tx.validatetxs = [
            new Buffer(sha256('1').toString(), 'hex'),
            new Buffer(sha256('2').toString(), 'hex')
        ]

        this.tx.txdata.in = [
            new Buffer(sha256('source1').toString(), 'hex'),
            new Buffer(sha256('source2').toString(), 'hex'),
        ];
        this.tx.txdata.out = [
            new Buffer(sha256('recipient').toString(), 'hex'),
            new Buffer(sha256('change').toString(), 'hex'),
        ];

        this.tx.txdata.bet = new Buffer(sha256(Math.random()).toString(), 'hex');
        this.tx.txdata.betKey = new Buffer(sha256(Math.random()).toString(), 'hex');

        this.tx.hash = new Buffer(sha256(this.tx.txid + this.tx.validatestxs).toString());
        this.tx.signature = new Buffer(sha384(this.tx.hash).toString());
        return txSchema.encode(this.tx).length;
    }
}