const EthereumTx = require('ethereumjs-tx');
const privateKeys = require('./truffle-keys').private;
const publicKeys = require('./truffle-keys').public;
const ShipmentTracking = artifacts.require('./ShipmentTracking.sol');

contract('ShipmentTracking', function(accounts) {
  let contract;
  let owner;
  let web3Contract;

  before(async () => {
    let _packageId = 1;                 // uint 
    let _from = "Stephen Blum";         // string 
    let _to = "Ian Jennings";           // string 
    let _originName = "San Francisco";  // string 
    let _destinationName = "Austin";    // string 
    let _custodian = "Tommy from Shipping Co."; // string 
    let _departureTime = 1518549958;    // uint 

    contract = await deployWithArguments(
      ShipmentTracking,
      _packageId,
      _from,
      _to,
      _originName,
      _destinationName,
      _custodian,
      _departureTime,
    );

    console.log(contract.address);

    web3Contract = web3.eth.contract(contract.abi).at(contract.address);
    owner = web3Contract._eth.coinbase;
    let other = web3.eth.accounts[1];

    if (publicKeys[0] !== owner || publicKeys[1] !== other) {
      throw new Error('Use `truffle develop` and /test/truffle-keys.js');
    }

    contract.allEvents({}, (error, details) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Event', details.event);
        for (let prop in details.args) {
          if (details.args[prop].toNumber) {
            details.args[prop] = details.args[prop].toString();
          }

          // console.log(prop, details.args[prop]);
        }
      }
    });

    await wait(30000);

  });

  it('should pass if contract is deployed', async function() {
    let to = await contract.to.call();
    assert.strictEqual(to, 'Ian Jennings');
  });

  it('should return initial details', async function() {
    let details = await contract.getDetails.call();
    assert.strictEqual(details[1], 'Stephen Blum');
  });

  it('should arrive', async function() {
    await wait(5000);
    let details = await contract.arrive(
      'Reno',
      'Bobby from Shipping Co.',
      0,
      {from: web3.eth.accounts[1], gas:3000000}
    );
  });

  it('should depart', async function() {
    await wait(5000);
    let details = await contract.depart(
      1,
      0,
      {from: web3.eth.accounts[1], gas:3000000}
    );
  });

  it('should deliver', async function() {
    await wait(5000);
    let details = await contract.deliver(
      'Austin',
      'Ian Jennings',
      0,
      {from: web3.eth.accounts[1], gas:3000000}
    );
  });

  it('waits for all events to finish being mined and fire', async function() {
    await wait(5000);
  });

});

/* Deploy a contract */
function deployWithArguments(
  _artifact,
  _packageId,
  _from,
  _to,
  _originName,
  _destinationName,
  _custodian,
  _departureTime,
) {
  let stContract = web3.eth.contract(_artifact.abi);
  return new Promise((resolve, reject) => {
    stContract.new(
      _packageId,
      _from,
      _to,
      _originName,
      _destinationName,
      _custodian,
      _departureTime,
      {
        from: web3.eth.accounts[0],
        data: _artifact.bytecode,
        gas: 3000000
      }, function(err, myContract){
        if (err) {
          reject(err);
        }

        if (myContract.address) {
          resolve(myContract);
        }
    });
  });
}

/*
 * Call a smart contract function from any keyset in which the caller has the
 *     private and public keys.
 * @param {string} senderPublicKey Public key in key pair.
 * @param {string} senderPrivateKey Private key in key pair.
 * @param {string} contractAddress Address of Solidity contract.
 * @param {string} data Data from the function's `getData` in web3.js.
 * @param {number} value Number of Ethereum wei sent in the transaction.
 * @return {Promise}
 */
function rawTransaction(
  senderPublicKey,
  senderPrivateKey,
  contractAddress,
  data,
  value
) {
  return new Promise((resolve, reject) => {

    let key = new Buffer(senderPrivateKey, 'hex');
    let nonce = web3.toHex(web3.eth.getTransactionCount(senderPublicKey));

    let gasPrice = web3.eth.gasPrice;
    let gasPriceHex = web3.toHex(web3.eth.estimateGas({
      from: contractAddress
    }));
    let gasLimitHex = web3.toHex(5500000);

    let rawTx = {
        nonce: nonce,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: data,
        to: contractAddress,
        value: web3.toHex(value)
    };

    let tx = new EthereumTx(rawTx);
    tx.sign(key);

    let stx = '0x' + tx.serialize().toString('hex');

    web3.eth.sendRawTransaction(stx, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });

  });
}

function wait (ms) { 
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};