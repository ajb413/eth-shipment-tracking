# Shipment Tracking

A [Truffle](http://truffleframework.com/) box.

Track shipments with the blockchain. Announce arrival, departure, and delivery information with Ethereum. Send updates to the package beneficiaries using [Pubnub Functions](https://www.pubnub.com/products/functions/).

The node.js script in `app/` monitors contract specific events and publishes messages over PubNub. Pubnub Functions can then send an alert with an email, push notification, SMS, API call and more.

Method calling is **not protected**, so anyone can add to the ledger if they have the contract address.