var bigint = require('bigintjs'),
    bignum = require('bignum'),
    _ = require('lodash'),
    sha256 = require('crypto-js/sha256'),
    request = require('request-promise');

var max = bignum('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
var min = bignum('0000000000000000000000000000000000000000000000000000000000000000', 16);
var txPerBlock = 20;
var timePerBlock = 10000;
var c = 0, f = 0;
// var tx = bignum('4d40a0d68fc33bd2f53f3c7c00185103b6accc2a05467d4b92f71eb3790793ce', 16);
var tx = bignum(getNewTXID(),16);
var rl = tx.sub(min).div(txPerBlock);
var rh = max.sub(tx).div(txPerBlock);
console.log('txhash  ', tx.toString(16));
console.log('fromlow ', rl.toString(16));
console.log('fromhigh', rh.toString(16));

setInterval(() => {
    doBlock(tx, rl, rh, (hash) => {
        if(hash) {
            f++;
            tx = bignum(getNewTXID(),16);
            rl = tx.sub(min).div(txPerBlock);
            rh = max.sub(tx).div(txPerBlock);
            console.log('txhash  ', tx.toString(16));
            console.log('fromlow ', rl.toString(16));
            console.log('fromhigh', rh.toString(16));
        }
        console.log(`Found ${++c}: ${hash} - Stats ${f / c}`)
    })
}, timePerBlock);

function doBlock(tx, rl, rh, next) {
    request.get('https://blockchain.info/es/unconfirmed-transactions?format=json')
        .then((html) => {
            const pool = JSON.parse(html);
            const numTX = pool.txs.length;
            const txs = pool.txs;
            for (var i = 0; i < Math.min(txPerBlock, numTX); i++) {
                var hash = txs[i].hash;
                if (hash && hash != '') {
                    var h = bignum(hash, 16);
                    console.log('Test:  ' + i + ' ' + hash);
                    if (h.ge(tx.sub(rl)) && h.le(tx.add(rh))) {
                        console.log('Encontre ' + hash)
                        return next(hash);
                    }
                }
            }
            return next(false);
        })
        .catch((err) => {
            console.error('Error getting memory pool', err)
            return next(err);
        })
    // setTimeout(doBlock(tx, rl, rh), timePerBlock);
}


function getNewTXID() {
    var r = sha256(Math.random().toString() + Math.random().toString()).toString();
    return r;
}
bigint.lmag = function (m, n) {
    if (m.length < n.length) {
        return true;
    }
    else if (m.length > n.length) {
        return false;
    }
    else {
        for (var i = m.length - 1; i >= 0; i--) {
            if (m[i] < n[i]) {
                return true;
            }
            else if (m[i] > n[i]) {
                return false;
            }
        }
        return false;
    }
}

//var a='0x60ab34a43a9f3a6ecd42da2a4f60b1a94d8262dc18618602256868e57a425cd2';
//var b='0x03c9ed0591df35c787cab4df56ce7d182156e6631802b49da46157bc19d10e81';
//var c='0x50102d9e11631e5c3e05a04ff783d5927c4d5c1fab1c43b78fbeb501c580a831';
//var d=sha256(Math.random());


/*
 var a = '0x' + sha256(Math.random().toString()).toString();
 var b = '0x' + sha256(Math.random().toString()).toString();
 var c = '0x' + sha256(Math.random().toString()).toString();
 console.log(a)
 console.log(b)
 console.log(c)
 var ab = bigint(a).subtract(b).toString().replace('-', '');
 var ac = bigint(a).subtract(c).toString().replace('-', '');
 var bc = bigint(b).subtract(c).toString().replace('-', '');

 console.log("ab " + ab + "\nac " + ac + "\nbc " + bc + "\n");

 console.log('ab<ac?=' + bigint.lmag(ab, ac));
 console.log('ab<bc?=' + bigint.lmag(ab, bc));
 console.log('ac<bc?=' + bigint.lmag(ac, bc));
 console.log('ac<ab?=' + bigint.lmag(ac, bc));
 */
