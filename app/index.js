// A node.js app
// Monitors contract events with web3.js and publishes their details over PubNub

const Web3 = require('web3');
const PubNub = require('pubnub');
const abi = require('../build/contracts/ShipmentTracking').abi;

const providerURI = 'https://mainnet.infura.io/__TOKEN_HERE__';
const ethAddress = process.env.contract_address;

const pubnub = new PubNub({
  publishKey : '__YOUR_PUBNUB_PUBLISH_KEY__',
  subscribeKey : '__YOUR_PUBNUB_SUBSCRIBE_KEY__'
});
const pubnubChannel = '__YOUR_CHANNEL__';

const web3Provider = new Web3.providers.HttpProvider(providerURI);
const web3 = new Web3(web3Provider);
const contract = new web3.eth.contract(abi).at(ethAddress);

// Publish the event message over PubNub. PubNub Functions can edit and
// broadcast the message content to an email list, SMS list, API endpoint
// and more.
contract.allEvents({}, (error, details) => {

  let publishConfig = {
    channel : pubnubChannel,
    message : {
      'error': error,
      'details': details
    }
  };

  pubnub.publish(publishConfig, (status, response) => {
    console.log(status, response);
  });

});
