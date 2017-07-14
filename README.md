# Tumin
Tumin is an experimental crypto coin that is enviromentally friendly, secure and with fair distribution and usage.

## ICO

We want to develop a system and coin that be fair with everyone, but we need funding to fully dedicate to the development.

So we thought what would be the best way for an Initial Coin Offer, that does not involve premining and that is attractive to early adopters and investors.

We found that the best way is an offer for earnly adopters and investors that is very simple and logical: `10% of all the blocks divided proportionally to every early adopter.`



### Main Features
* Unique Proof of Luck (PoL) to validate transactions
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
* Human friendly accounts supported
* Paper money bills
* Smart Contracts


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
    + DEPRECATED IDEA, it is not required because the TXID will change with time until it finds the appropiate other TXIDs
* Transfer Transaction
    + This type of transaction transfers funds, have at least one input and at least one output
* Smart Contract Transaction
    + This type of transaction is to be defined
* Human Friendly Transaction
    + An account that is a bridge for human friendly account transfer
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
    + The minimum amount of validation transactions are 2. Weight equals to 3^(NumValidatedTransactions-2)
* Accumulated weight
    + The sum of all the weights for the longest path to the genesis for a new transaction.
* Address
    + A Base58 representation of the public key
* Public key
    + A key derivated from a master public key
* Private key
    + A key derivated from the master private key 
* Unit
    + The base unit tumin is suggested as 90 million coins with 8 decimals distributed in about 200 years
* Capable of paper money like bills
    + Bills with good security and double spending protection
* Human friendly account
    + An account composed by only letters from A to Z, case insensitive
    
### How it works

At the first, Tumin creates a new genesis transaction called Main Genesis Transaction. It is hardcoded in the code. It does not contains nor generate coins, only timestamp and hash.
 
Then, one or more nodes joins to the mesh. They also create their own genesis transactions and broadcast them to their connected nodes.
Every new genesis transactions generates a new tangle that can operate without contact to other tangles, except that they can't generate new coins
as only transactions that are linked to the main genesis transaction can generate coins.

After that, the full nodes must start to generate at least spam transactions, but they can also generate minting transactions.
Once the node has a new transaction, it must add to the tangle. To do that, it must validate two previously not completed transaction.

To validate a transaction it must fulfill validation algorithm.

If the node created a new spam transaction it should adjust its nonce to fulfill the validation algorithm.

A node could be of three types:

* Light node, that has no information about the tangle, and require to connect to an external provider to issue and receive transactions.
    + Must have connection to at least 3 providers and broadcast every transaction to all of them.
* Half node, that has partial information about the tangles. 
    + It could be configurable the number of tangles that has into its database
    + If it reaches the max number of tangles stored, then flushes not accessed ones to allow newer tangles to come into the database
    + It must have connection to at least 7 neighbors
* Full node, that tries to have all the information about all the tangles.
    + It mus have connection to at least 49 neighbors and save all the tangle information it receives from them
    
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


### Minting

The absolute max Tumins are going to be (based on Javascript Max Safe Integer) with 8 decimals that is about 90 million coins. 
```math
MSupply = 2^53-1
```
 
The base reward for every minting transaction is calculated and decreased with this formula:
```math
BaseReward = (MSupply − A) >> 25
```


An expected time for confirmation of `10 seconds` on average, with a time for total minting of about `212 years`.

A minting transaction is basically a bet. The issuer of the mint transaction bets that the sha256 of all the TXIDs since it places the mint transaction until someone places a bet transaction (24 hours later at least) is going to have the lower difference from a random number into the mint transaction.

A mint transaction encrypts the bet random number with a aes256 algorithm with an strong random key, then the transaction is added to the tangle with at least one of its input links that have a direct route the main genesis transaction.

24 hour later other full node could place a bet transaction, that is only a guess of what would result when hashing all the TXIDs since the mint transaction plus the number that the mint transaction contains encrypted.

The bet transaction must come with an amount of coins equal to 1% of the BaseReward claimed by the mint transaction.

There are another 24 hours for placing the bet transactions. After that, no more bet transactions to that mint transaction could be added.
 
The bet transaction must have a direct path to the mint transaction.

After 24 hours from the end of betting, the minting node could place a mint claim transaction, that includes the key used to encrypt the mint transaction.

Then, if the number issued by the minting node is the nearest to the hash, it receives the reward and the funds in bets by other transactions are released to their original owner.

If the number of one of the bets is the nearest, then it receives all the amount of the bets, and the reward is not issued to anyone.

If the minting node does not issues the mint claim transaction on time, then all the funds in bets are released and the minting node loses the the right to claim the coins.

A mint transaction is confirmated once the mint claim transaction is confirmed

### Transfer

The issuer of the transaction must have an input of funds, an output for funds and the key to approve that input of funds.

```json
{
  "TXID": "sha256OfTXData",
  "TXData": {
    "type": "TransactionTypeIdentifier",
    "timestamp": "UnixTimeStampWithMilliseconds",
    "inputs": ["TXID_1","TXID_2",...],
    "outputs": [
      {
        "address": "addressOfReceiver",
        "amount": "amountToReceive"
      },....
    ],
    "script": "optionalBytecodeForSmartContract"
  },
  "ValidatesTXs": ["ArrayOfTXIDsThatValidates"],
  "hash": "sha256OfEverythingExceptTheHashAndSignature",
  "signature": "signatureOfTXData_by_all_the_required_keys"
}
```

A transfer transaction could be accepted after first validation, but it is recommended that it is a completed transaction with the 7 links.

### Spam transaction

When there are not TX to validate a new transaction it is easier to do some work to find a nonce that generates a new TXID that could be added to the tangle and be used as a new option for another transaction.

This could be at the begining of a tangle or when there are low amount of new transactions.

It simply generates a basic transaction and adds a nonce like this example:

```json
{
  "TXID": "sha256OfTXData",
  "TXData": {
    "type": "TransactionTypeIdentifier",
    "timestamp": "UnixTimeStampWithMilliseconds",
    "nonce": "numberThatFormsTheNonce"
  },
  "ValidatesTXs": ["ArrayOfTXIDsThatValidates"],
  "hash": "sha256OfEverythingExceptTheHashAndSignature",
  "signature": "signatureOfTXData_by_all_the_required_keys"
}
```


### Adding a transaction to the tangle

To be able to add a transaction to the tangle it must fulfill these condition:

* The timestamp must be equal to the receiver node timestamp and to the timestamp of the TX it is validating.
* The TXID of the validated transactions must be fulfill the rules for validation intervals.
* The inputs spent must be registered as unspent in the receiver node.
* The total amount of input coins must be spent and sent to another recipient
* The recipient addresses must not be used in any other place
* The to validate transactions must not be already completed
* Should be sent to all the neighbors

### Selection of to validate transactions

The transaction issuer must have a list of incomplete transactions to find valid transactions there.

The list must be grouped and descendent sorted by weight, and then sorted by random.
 
Then the issuer must run the algorithm for finding valid transactions. If it don't find valid transactions, it should 
ask for more transactions to the node, to their neighbors and if after that it can't validate its transaction then it can
wait more time until newer transaction list comes, or start creating spam transactions to increase the pool of to validate transactions.

The transactions must be checked to certain depth, at least 7 days depth and check the signatures and the correct validation of its validated transactions.


### Human friendly accounts

The address is derived from the sha256d of master public key, taking latest 16 hex digits and 
then doing a ripemd160 on the 8 padded result to fit in 14 characters, and adding the latest hex digit as a verification digit of the account.

Then it is converted to base25 (A to Z, the number 8, case insensitive)

Let suppose that Alice wants to send money to Joe with account 8ABCDEFGHIJKLM

She creates a Human Friendly Transaction (HFT) with the sha384d of the account plus a random nonce, and the amount to transfer and sends to the network.

On the other side Joe (and others) are listening for the network and when a HFT transactions comes, they test with their master public key
 to see if the sha384d of it plus the nonce is equal.
 
If the result is true, Joe creates a new transfer transaction using the Alice's transaction as input, a new address from his 
master public key as output, the master public key and signing the transaction with the recipient address.

Because the human friendly account is shorter than a regular address, there is increased risk of collision.


### Paper money bills

A paper money bill is composed of two parts.

* Verifier address
    + It is used to check balance, last operation on that address, potential disposal requests
* Dispose code
    + Used to extract the funds of that bill
    
A DAO is required to issue this bills. The DAO, once created, will have full control of all Tumin deposited on it.

Let suppose that a community wants to issue 1000 of 1 Tumin bills. They ask the DAO for an address to deposit that amount for that quantity of bills.

The dao generates that address, and once the funds are registered and fully confirmed, it releases 
1000 verifier addresses and 1000 disposal codes.

Then the community can print that information into paper bills, and distribute them as they wish.

To prevent double spending of the bills (double printing of them, o disposing the funds after spending the bill) the disposal request
takes 30 days. The user ask the DAO for disposal of the funds with the dispose code, and the dao registers that.

If between that time and the 30 days limit any action is issued on the verifier address (balance check, other disposal request), then all the 
disposal requests are cancelled, as the bill should have only one owner until the latest disposal request is finished.

If someone prints two or more copies of the bill, and distributes them, there is a lock based on time and distance from last action on
the bill (balance check for example)

If one receives the bill and checks the balance, the dao will register the time and coordinates of that action. And based on a formula (TBD, maybe standard deviation of all the transactions of bills of same value) the 
DAO issues an alert if the bill was checked in a place that is too far from the current place of the bill, based on the 
probability that the bill has travel that distance in that amount of time.

Then the user must decide if he accepts that bill or denies it.


### Smart Contracts

The functionallity of smart contracts is a turin complete virtual machine embedded into the Tumin system.

For this, in the first time a new smart contract is created and tested by the developer, then he creates an smart contract transaction that embeds the compiled
code of the contract, and sends it to the network.

The nodes receive it and once it is confirmed, it can be used. The contract must offer an API to consume their resources.

Let suppose then that a user wants to consume a method called issue from an smart contract called PaperBill

He creates a new smart contract transaction that consumes that method with the arguments, and tests into his own node until complete, to find out what will be the cost of that transaction.

Then, creates a new transaction, and looks to add it to the network using a weight adjusted to the resources used by that call.

The transaction is sent to the nodes, and then the nodes try to execute it using only the resources "paid" by the luck consumed to place that transaction.

Let suppose that the call to the contract consumes 30 virtual machine steps, and that every 10 steps require 1 weight point.

If the user sends the transaction with only a weight of 1, then it will fail to be added to the nodes, as the nodes will try to validate the transaction running it for only
1 block of virtual machine steps. Then all that nodes will reject the transaction.

If the user sends it with a weight of 9 then the nodes will run it to the end, and accept it and add to the tangle.


### Known possible problems

* Double spending
    + It could be double spending in two tangles at some time. The double spending risk can be reduced checking that the transaction has validations from many other tangles

#### We took ideas from
* [Iota Tangle](http://iota.org)
* [Bitcoin](http://bitcoin.org)
* [Monero](http://getmonero.org)

#### References
[Max Safe Integer in Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)

### Author
Mario Alberto Medina Nussbaum

### TODO

#### Prevent high CPU power spam transactions to fill the fabric 
* Calculate the 24 hour average of TX/second on every fabric 
* Calculate max hash rate of a node at startup
* Divide that hash rate by the total of TXs per fabric to assign a max quota of hashes per spam transaction
* Reject any new spam transaction that exceeds that limit
    + If 70% of neigbours are offering me a spam tx that exceeds that limit, well, accept it

#### Prevent fabric bloating with too much transactions that are not normal organic growth
* Use the 24 hour average of TXs plus a 10% to limit the amount of new TX received per fabric
    + The 10% is arbitrary, it could be 1 standard deviation instead of 10%
    + It includes normal TX and spam ones
* If a light node exceeds that limit, then punish it rejecting the transactions
* If it is a neigbour that exceeds, then punish it by blocking it for a while with a black list


#### Change to Curl for quantum proof
* Replace non quantum proof hashes with others that are quantum proof