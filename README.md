# Tumin
Tumin is an experimental crypto coin that is enviromentally friendly, secure and with fair distribution and usage.

### Main Features
* No PoW - You do not require powerful CPU/GPU/ASIC to validate transactions.
* No PoS - You do not require big amount of coins to validate transactions
* No single blockchain. It uses multiple inheritance like trees.
* No premine - Fair distribution between full nodes
* No centralized ledger, but distributed trees
* Transaction validation spends "luck" instead of energy or time
* No hard forks - planned mechanism for software and features upgrades
* No 51% attack, as there are no PoS nor PoW
* Quantum safe as it uses strong encryption and do not recycles keys
* No fees, every value transfer is done without fees
* Low confirmation time with very low variance
* Based on Directed Acyclid Graph or DAG
* Without clear diference of roles

### Terminology and reference
* Enredo (Tangle)
    + is like tree. The crypto can have multiple tangles, as every full node could generate a new genesis transaction.
* Genesis Transaction
    + Is the only one transaction that do not require to validate other transactions. There could be multiple genesis transactions.
* Main Genesis Transaction
    + Is the first of all transactions, hardcoded. All coin minting must have a direct route to this transaction
* Minting Transaction
    + This type of transaction is used to generate new coins.
* Bet Transaction
    + This type of transaction is used to ask for minting claim or release
* Mint Claim Transaction
    + This type of transaction claims reward or releases bet funds 
* Spam Transaction
    + This type of transaction does not have inputs or outputs, only a nonce
* Transfer Transaction
    + This type of transaction transfers funds, have at least one input and at least one output
* Smart Contract Transaction
    + This type of transaction is to be defined
* Nonce
    + An integer used in spam transactions to modify its hash for validations.
* Proof of Luck
    + A process that uses probability and luck to force new transactions to take certain amount of time to place a new transaction
* Hash
    + A sha256 (maybe sha384 or sha512, to be defined) of some data
* Mesh
    + All the group of full nodes that compose the network. They don't need to be connected with every other node, but only 7 of them
* Not completed transaction
    + A transaction with an input link and 7 output links is a complete transaction, every transaction that has an input but less than 7 out links is not completed.
* Weight
    + The amount of luck spent. Starts in 0 for genesis transactions and 1 for other ones.
* Accumulated weight
    + The sum of all the weights for the longest path to the genesis for a new transaction.
    
### How it works

At the first, Tumin creates a new genesis transaction called Main Genesis Transaction. It is hardcoded in the code. It does not contains nor generate coins, only timestamp and hash.
 
Then, one or more nodes joins to the mesh. They also create their own genesis transactions and broadcast them to their connected nodes.
Every new genesis transactions generates a new tangle that can operate without contact to other tangles, except that they can't generate new coins
as only transactions that are linked to the main genesis transaction can generate coins.

After that, the full nodes must start to generate at least spam transactions, but they can also generate minting transactions.
Once the node has a new transaction, it must add to the tangle. To do that, it must validate two previously not completed transaction.

To validate a transaction it must fulfill validation algorithm.

If the node created a new spam transaction it should adjust its nonce to fulfill the validation algorithm.


### Validation algorithm

The validation algorithm uses:

* Time Per Block in milliseconds (t)
* Transactions per Time per block (T)
* Max and Min value (2^256 and 0 for sha256)
* TXID, the sha256 of the transaction data without including the two other transactions ids
* An array of other TXIDs from all unconfirmed (not completed) transactions sorted by accumulated weight and then by random.

I think is better to write an algorithm in pseudo code, so here it is.

```javascript
let t = 10000;
let Min = 0;
let Max = 2^256-1;;
let T = AverageNumberOfTransactionsPerPeriodLast24Hours()
let TXID = sha256(TransactionData);
let Luck = 1 / T;
let LowEnd = TXID - ((TXID-Min) * (Luck/2));
let HighEnd = TXID + ((Max-TXID) * (Luck/2));
RepeatUntil
    let TXIDs = Array(Group of non validated TXIDs)
    forEach(TXIDs as txid) 
        if txid >= LowEnd AND txid <= HighEnd then
            if !ValidTX1 then ValidTX1=txid else ValidTX2=txid
            if ValidTX1 AND ValidTX2 then
                ValidateTransaction(ValidTX1, ValidTX2, TransactionData)
            endif
        endif
    endForEach
RepeatUntil TransactionValidated
```


#### We took ideas from
* Iota Tangle
* Bitcoin