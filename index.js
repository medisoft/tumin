var bigint = require('bigintjs');
var sha256 = require('crypto-js/sha256');
var request = require('request');


request.get()

bigint.lmag = function(m,n) {
		if (m.length < n.length) {
			return true;
		}
		else if (m.length > n.length) {
			return false;
		}
		else {
			for (var i=m.length-1;i>=0;i--) {
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
var a = '0x'+sha256(Math.random().toString()).toString();
var b = '0x'+sha256(Math.random().toString()).toString();
var c = '0x'+sha256(Math.random().toString()).toString();
console.log(a)
console.log(b)
console.log(c)
var ab =bigint(a).subtract(b).toString().replace('-','');
var ac =bigint(a).subtract(c).toString().replace('-','');
var bc =bigint(b).subtract(c).toString().replace('-','');

console.log("ab "+ab+"\nac "+ac+"\nbc "+bc+"\n");

console.log('ab<ac?='+bigint.lmag(ab,ac));
console.log('ab<bc?='+bigint.lmag(ab,bc));
console.log('ac<bc?='+bigint.lmag(ac,bc));
console.log('ac<ab?='+bigint.lmag(ac,bc));
