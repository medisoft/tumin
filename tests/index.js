var bigint = require('bigintjs'),
    bignum = require('bignum'),
    _ = require('lodash'),
    sha256 = require('crypto-js/sha256'),
    request = require('request-promise'),
    numeral = require('numeral');

if (global.gc) {
    global.gc();
} else {
    console.log('Garbage collection unavailable.  Pass --expose-gc '
      + 'when launching node to enable forced garbage collection.');
}
//console.log(bignum.pow(26,14).sub(1).div(15).toString(16)); return // 3baf08037bf6d111
// var MSupply = bignum.pow(2,64).sub(1).toString(10);
// var MSupply = bignum.pow(2,53).sub(1).div(bignum.pow(10,14)).toString(10);
var RewardDivisor = 25;
var SupplyMultiplier = 53;
var MSupply = bignum.pow(2, SupplyMultiplier).sub(1);
var NumBlocks = bignum.pow(2, SupplyMultiplier - RewardDivisor);
// var MSupply = bignum.pow(2,64).sub(1).div(bignum.pow(10,13)).toString(10);
console.log(`${numeral(bignum(2100000000000000)).format('0,0')} satoshis`)
console.log(`${numeral(MSupply).format('0,0')} repartidas en ${numeral(NumBlocks).format('0,0')} bloques, el primero de ${numeral(MSupply.shiftRight(RewardDivisor)).format('0,0')}`)
// console.log(`Equivalente a ${numeral(NumBlocks.div(86400*365.25)).format('0,0')} años`)
// return;
var A = bignum(0), b = 0;
var BaseReward=bignum(0);
// var _interval = setInterval(() => {
while(true) {
    BaseReward = MSupply.sub(A).shiftRight(RewardDivisor).add(1);
    // if(BaseReward.lt(1)) BaseReward=1;
    if (MSupply.sub(A).eq(0)) {
    // if (false) {
        // clearInterval(_interval);
            console.log(`Reward ${numeral(BaseReward).format('0,0')}, already gave ${numeral(A).format('0,0')}, to give ${numeral(MSupply.sub(A)).format('0,0')} at block ${numeral(b).format('0,0')} eq ${numeral(b/(8640*365.25)).format('0,0.00')} years`)
        return;
    } else {
        if (b % 50000 == 0) {
            // console.log(`Reward ${numeral(BaseReward).format('0,0')}, already gave ${numeral(A).format('0,0')}, at block ${numeral(b).format('0,0')} eq ${numeral(b/(8640*365.25)).format('0,0.00')} years`)
            console.log(`Reward ${numeral(BaseReward).format('0,0')}, already gave ${numeral(A).format('0,0')}, to give ${numeral(MSupply.sub(A)).format('0,0')} at block ${numeral(b).format('0,0')} eq ${numeral(b/(8640*365.25)).format('0,0.00')} years`)
if(global.gc) global.gc();
}
        b++;
        A = A.add(BaseReward);
    }
}
// }, 0);
return;

// 703,687.4417 7663
var max = bignum('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
var min = bignum('0000000000000000000000000000000000000000000000000000000000000000', 16);
var txPerBlock = 20;
var timePerBlock = 10000;
var c = 0, f = 0;
// var tx = bignum('4d40a0d68fc33bd2f53f3c7c00185103b6accc2a05467d4b92f71eb3790793ce', 16);
var tx = bignum(getNewTXID(), 16);
var rl = tx.sub(min).div(txPerBlock);
var rh = max.sub(tx).div(txPerBlock);
console.log('txhash  ', tx.toString(16));
console.log('fromlow ', rl.toString(16));
console.log('fromhigh', rh.toString(16));

setInterval(() => {
    doBlock(tx, rl, rh, (hash) => {
        if (hash) {
            f++;
            tx = bignum(getNewTXID(), 16);
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
