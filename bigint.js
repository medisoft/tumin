// bigint.js
// A Big Integer implementation in Javascript

var BigInt = function() {

	this.digits = [0];		// Store digits least-significant first
	this.negative = false;	// Flag for negativity
	
	// Set bigint to an arbitrary string of digits
	this.set = function(s) {
		this.digits = [];
		var start;
		if (s[0] == '-') {
			start = 1;
			this.negative = true;
		}
		else {
			start = 0;
			this.negative = false;
		}
		for (var i=s.length-1;i>=start;i--) {
			this.digits.push(parseInt(s[i]));
		}
		return this;
	};
	// Convert this bigint to its digit-string
	this.str = function() {
		var s = '';
		if (this.negative) { s += '-'; }
		for (var i=this.digits.length-1;i>=0;i--) {
			s += this.digits[i];
		}
		return s;
	};
	
	// COMPARISONS
	
	// Equality
	this.eq = function(n) {
		if (this.negative != n.negative || this.digits.length != n.digits.length) {
			return false;
		}
		else {
			for (var i=0,l=this.digits.length;i<l;i++) {
				if (this.digits[i] != n.digits[i]) {
					return false;
				}
			}
			return true;
		}
	};
	// Helper: Is the magnitude of m less than the magnitude of n?
	function lmag(m,n) {
		if (m.digits.length < n.digits.length) {
			return true;
		}
		else if (m.digits.length > n.digits.length) {
			return false;
		}
		else {
			for (var i=m.digits.length-1;i>=0;i--) {
				if (m.digits[i] < n.digits[i]) {
					return true;
				}
				else if (m.digits[i] > n.digits[i]) {
					return false;
				}
			}
			return false;
		}
	}
	// Helper: Is the magnitude of m greater than the magnitude of n?
	function gmag(m,n) {
		if (m.digits.length > n.digits.length) {
			return true;
		}
		else if (m.digits.length < n.digits.length) {
			return false;
		}
		else {
			for (var i=m.digits.length-1;i>=0;i--) {
				if (m.digits[i] > n.digits[i]) {
					return true;
				}
				else if (m.digits[i] < n.digits[i]) {
					return false;
				}
			}
			return false;
		}
	}
	// Less Than
	this.lt = function(n) {
		if (!this.negative && n.negative) {			// Positive ints are never less than negative ints
			return false;
		}
		else if (this.negative && !n.negative) {	// Negative ints are always less than positive ints
			return true;
		}
		else if (this.negative) {	// Both ints are negative: this < n iff this.mag > n.mag
			return gmag(this,n);
		}
		else {						// Both ints are positive: this < n iff this.mag < n.mag
			console.log('LMAG');
			return lmag(this,n);
		}
	};
	// Greater Than
	this.gt = function(n) {
		if (!this.negative && n.negative) {			// Positive ints are always greater than negative ints
			return true;
		}
		else if (this.negative && !n.negative) {	// Negative ints are never greater than positive ints
			return false;
		}
		else if (this.negative) {	// Both ints are negative: this > n iff this.mag < n.mag
			return lmag(this,n);
		}
		else {						// Both ints are positive: this > n iff this.mag > n.mag
			return gmag(this,n);
		}
	};
	
	// INCREMENT AND DECREMENT
	
	// Helper: Increment the absolute value
	function _inc() {
		var i = 0;
		this.digits[i]++;
		while (this.digits[i] > 9 && i < this.digits.length-1) {
			this.digits[i] = 0;
			i++;
			this.digits[i]++;
		}
		if (this.digits[i-1] > 9 && i >= this.digits.length-1) {
			this.digits[i-1] = 0;
			this.digits.push(1);
		}
	}
	// Helper: Decrement the absolute value
	function _dec() {
		var i = 0;
		this.digits[i]--;
		while (this.digits[i] < 0 && i < this.digits.length-1) {
			this.digits[i] = 9;
			i++;
			this.digits[i]--;
		}
		if (this.digits[this.digits.length-1] == 0 && this.digits.length > 1) {
			this.digits.pop(this.digits.length-1);
		}
	}
	// Increment this bigint
	this.inc = function() {
		if (this.negative) {
			_dec();
		} else {
			_inc();
		}
		return this;
	};
	// Decrement this bigint
	this.dec = function() {
		if (this.negative) {
			_inc();
		} else {
			_dec();
		}
		return this;
	};
	
	// ADDITION AND SUBTRACTION
	
	function _add(m,n) {
		var sum = new BigInt(), sd = [], md = m.digits, nd = n.digits, carry = 0, tmp;
		
		for (var i=0,l=nd.length;i<l;i++) {
			tmp = md[i] + nd[i] + carry;
			sd.push(tmp % 10);
			carry = (tmp > 9)?1:0;
		}
		
		k = nd.length;
		if (carry == 1) {
			sd.push(1);
			k++;
		}
		
		while (k < md.length) {
			sd.push(md[k]);
			k++;
		}
		
		sum.digits = sd;
		
		return sum;
	}
	
	function _sub(m,n) {
		var diff = new BigInt(), dd = [], md = m.digits, nd = n.digits, borrow = 0, k;
		
		for (var i=0,l=nd.length;i<l;i++) {
			if (md[i] < nd[i]) {
				dd.push(10 + md[i] - nd[i] - borrow);
				borrow = 1;
			}
			else {
				dd.push(md[i] - nd[i] - borrow);
				borrow = 0;
			}
		}
		
		k = nd.length;
		if (borrow == 1) {
			dd.push(md[k] - borrow);
			k++;
		}
		
		while (k < md.length) {
			dd.push(md[k]);
			k++;
		}
		
		k = dd.length - 1;
		while (dd[k] == 0 && dd.length > 1) {
			dd.pop();
			k--;
		}
		
		diff.digits = dd;
		
		return diff;
	}
	
	// Addition
	this.add = function(n) {
		var sum;
		if (!this.negative && !n.negative) {
			console.log('Two positive');
			if (gmag(this,n)) {
				console.log('m > n');
				sum = _add(this,n);
			}
			else {
				console.log('m < n');
				sum = _add(n,this);
			}
			sum.negative = false;
		}
		else if (this.negative && n.negative) {
			if (gmag(this,n)) {
				sum = _add(this,n);
			}
			else {
				sum = _add(n,this);
			}
			sum.negative = true;
		}
		else if (!this.negative && n.negative) {
			if (gmag(this,n)) {
				sum = _sub(this,n);
				sum.negative = false;
			}
			else {
				sum = _sub(n,this);
				sum.negative = true;
			}
		}
		else if (this.negative && !n.negative) {
			if (gmag(this,n)) {
				sum = _sub(this,n);
				sum.negative = true;
			}
			else {
				sum = _sub(n,this);
				sum.negative = false;
			}
		}
		
		// There is no such thing as "negative zero".
		if (sum.digits.length == 1 && sum.digits[0] == 0) {
			sum.negative = false;
		}
		
		return sum;
	};
	
	// Subtraction
	this.sub = function(n) {
		var diff;
		if (!this.negative && !n.negative) {	// m - n
			if (gmag(this,n)) {
				diff = _sub(this,n);
				diff.negative = false;
			}
			else {
				diff = _sub(n,this);
				diff.negative = true;
			}
		}
		else if (this.negative && n.negative) {	// -m - -n = -m + n = n - m
			if (gmag(this,n)) {
				diff = _sub(this,n);
				diff.negative = true;
			}
			else {
				diff = _sub(n,this);
				diff.negative = false;
			}
		}
		else if (!this.negative && n.negative) {	// m - -n = m + n
			if (gmag(this,n)) {
				diff = _add(this,n);
			}
			else {
				diff = _add(n,this);
			}
			diff.negative = false;
		}
		else if (this.negative && !n.negative) {	// -m - n = -(m + n)
			if (gmag(this,n)) {
				diff = _add(this,n);
			}
			else {
				diff = _add(n,this);
			}
			diff.negative = true;
		}
		
		// There is no such thing as "negative zero".
		if (diff.digits.length == 1 && diff.digits[0] == 0) {
			diff.negative = false;
		}
		
		return diff;
	};
	
	// MULTIPLICATION
	
	this.mul = function(n) {
		
		var product = new BigInt(), pd = [], mm = [], ad, bd, tmp, carry = 0;
		
		if (gmag(this,n)) {
			ad = this.digits;
			bd = n.digits;
		}
		else {
			ad = n.digits;
			bd = this.digits;
		}
		
		for (var i=0,lb=bd.length;i<lb;i++) {
			for (var j=0,la=ad.length;j<la;j++) {
				tmp = ad[j]*bd[i] + carry;
				if (mm[i+j]==null) {
					mm[i+j] = (tmp % 10);
				}
				else {
					mm[i+j] += (tmp % 10);
				}
				carry = Math.floor(tmp/10);
			}
		}
		
		mm.push(carry);
		
		var k = mm.length - 1;
		while (mm[k] == 0 && mm.length > 1) {
			mm.pop();
			k--;
		}
		
		product.digits = mm;
		
		if (this.negative == n.negative) {
			product.negative = false;
		}
		else {
			product.negative = true;
		}
		
		// There is no such thing as "negative zero".
		if (mm.length == 1 && mm[0] == 0) {
			product.negative = false;
		}
		
		return product;
	};
};
