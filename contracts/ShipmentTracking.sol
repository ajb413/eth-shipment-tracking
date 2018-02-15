pragma solidity ^0.4.18;

/**
 * Shipment Tracking
 *
 * @title An example shipment tracking smart contract.
 */
contract ShipmentTracking {

    struct Location {
        string name;
        string custodian;
        uint arrival;
        uint departure;
    }

    event Departed(
        string location,
        string custodian,
        uint time,
        uint index
    );

    event Arrived(
        string location,
        string custodian,
        uint time,
        uint index
    );

    event Delivered(
        string location,
        string custodian,
        uint time
    );

    uint public packageId;
    string public from;
    string public to;
    string public originName;
    string public destinationName;
    uint public departureTime;
    uint public deliveryTime;

    Location[] locations;

    /**
     * Constructs a contract that updates and tracks location history of a
     *     package throughout shipment.
     * @param _packageId Unique id for the package.
     * @param _from String of from entity name.
     * @param _to String of to entity name.
     * @param _originName String of origin place name.
     * @param _destinationName String of destination place name.
     * @param _custodian String of package caretaker's name.
     */
    function ShipmentTracking(
        uint _packageId,
        string _from,
        string _to,
        string _originName,
        string _destinationName,
        string _custodian,
        uint _departureTime
    ) public {
        packageId = _packageId;
        from = _from;
        to = _to;
        originName = _originName;
        destinationName = _destinationName;
        departureTime = _departureTime;
        deliveryTime = 0;

        locations.push(Location({
            name: _originName,
            custodian: _custodian,
            arrival: 0,
            departure: now
        }));

        Departed(_originName, _custodian, now, locations.length - 1);
    }

    /**
     * @dev Fallback function
     */
    function() public payable { revert(); }

    /**
     * Sets a location in the locations array when the package arrives
     *     at a new location. Also publicly alerts via `Arrived`.
     * @param _name Location name.
     * @param _custodian Name of the custodian of the package at this location.
     * @param _arrival Unix time stamp in seconds of the arrival time.
     * @return True if success.
     */
    function arrive(
        string _name,
        string _custodian,
        uint _arrival
    )
        public
        returns (bool success)
    {
        if (_arrival == 0) {
            _arrival = now;
        }

        locations.push(Location({
            name: _name,
            custodian: _custodian,
            arrival: _arrival,
            departure: 0
        }));

        Arrived(_name, _custodian, _arrival, locations.length - 1);
        return true;
    }

    /**
     * Sets the departure time of the location in the locations array. Also
     *     publicly alerts via `Departed`.
     * @param _index Index of the location in the locations array.
     * @param _departure Unix time stamp in seconds of the departure time.
     * @return True if success.
     */
    function depart(
        uint _index,
        uint _departure
    )
        public
        returns (bool success)
    {
        if (_departure == 0) {
            _departure = now;
        }

        locations[_index].departure = _departure;

        Departed(
            locations[_index].name,
            locations[_index].custodian,
            _departure,
            _index
        );
        return true;
    }

    /**
     * Sets a location in the locations array when the package arrives
     *     at the final destination. Also publicly alerts via `Arrived` and
     *     `Delivered`.
     * @param _name Location name.
     * @param _custodian Name of the custodian of the package at this location.
     * @param _arrival Unix time stamp in seconds of the arrival time.
     * @return True if success.
     */
    function deliver(
        string _name,
        string _custodian,
        uint _arrival
    )
        public
        returns (bool success)
    {
        if (_arrival == 0) {
            _arrival = now;
        }

        locations.push(Location({
            name: _name,
            custodian: _custodian,
            arrival: _arrival,
            departure: 0
        }));

        Arrived(_name, _custodian, _arrival, locations.length - 1);
        Delivered(_name, _custodian, _arrival);
        return true;
    }

    /**
     * Gets all the details for the package contract in 1 call.
     * @return Returns all of the public members of the contract.
     */
    function getDetails()
        public
        constant
        returns (uint, string, string, string, string, uint, uint)
    {
        return (
            packageId,
            from,
            to,
            originName,
            destinationName,
            departureTime,
            deliveryTime
        );
    }

    /**
     * Gets all the locations in the array.
     * @return Returns all locations.
     */
    function getLocations()
        public
        constant
        returns (Location[])
    {
        return locations;
    }
}
