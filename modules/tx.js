/**
 * Created by mario on 23/04/17.
 */
var sha256 = require('crypto-js/sha256');
var varint = require('varint');

const GENESIS = 0x00;
const SPAM = 0x01;
const MINT = 0x02;
const BET = 0x03;
const MINTCLAIM = 0x04;
const TRANSFER = 0x05;
const SMART = 0x06;
const HFT = 0x07;

module.exports = {
    tx: {
        txid: undefined, // sha256 Of TXData
        txdata: {
            type: GENESIS,
            timestamp: new Date().getTime(),
            nonce: Math.random() * Math.pow(10, 18)
        },
        validatestxs: [
            sha256('1').toString(),
            sha256('2').toString(),
            sha256('3').toString(),
        ],
        hash: undefined, // sha256OfEverythingExceptTheHashAndSignature"
        signature: undefined // signatureOfTXData_by_all_the_required_keys
    },
    toJSON: function () {
        this.tx.txid = sha256(this.tx.txdata).toString();
        this.tx.hash = sha256(this.tx.txid + this.tx.txdata + this.tx.validatestxs).toString();
        this.tx.normal = 0x12401;
        this.tx.encoded = varint.encode(this.tx.normal);
        this.tx.decoded = varint.decode(this.tx.encoded);
        return JSON.stringify(this.tx);
    }
    ,
    toBIN: function () {
        return PSON.encode(this.tx);
    }
}