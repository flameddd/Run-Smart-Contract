pragma solidity ^0.4.11;


contract Owned {
    address owner;
    modifier onlyowner() {
        if (msg.sender == owner) {
            _;
        }
    }
    function Owned() {
        owner = msg.sender;
    }
}


contract Mortal is Owned {
    function kill() {
        if (msg.sender == owner)
            selfdestruct(owner);
    }
}


contract TicketDistribution is Mortal {

    address public owner;
    string public eventId;
    string public description;
    string public preView;

    function TicketDistribution(string _id, string desc, string preview) {
        owner = msg.sender;
        eventId = _id;
        description = desc;
        preView = preview;
        eventInfo(_id, desc, preview);
    }

    struct Info {
        string userId;
        string ticketId;
        string transactionId;
        bool isAttend;
    }

    mapping(string => mapping(string => Info)) ticketInfo;

    struct TxRec {
        string from_userId;
        string to_userId;
        string ticketId;
        string transactionId;
    }
    mapping(string => TxRec) transactionRec;
    
    event Transfer(string indexed from, string indexed to, string ticketId,  string transactionId);
    event eventInfo(string indexed id, string desc, string preview);

    function updateDesc(string _id, string _desc, string _view) returns(string, string){
        description = _desc;
        preView = _view;
        eventInfo(_id, _desc, _view);
        return (_desc, _view);
    }

    function attend(string to_userId, string ticketId) returns (bool) {
        ticketInfo[to_userId][ticketId] = (Info(to_userId, ticketId, ticketInfo[to_userId][ticketId].transactionId, true));
        return ticketInfo[to_userId][ticketId].isAttend;
    }

    function update(string from_userId, string to_userId, string ticketId, string transactionId) onlyowner returns(string, string, string) {
        require (! equal(transactionRec[transactionId].transactionId, transactionId));
        require ( equal(ticketInfo[from_userId][ticketId].userId, from_userId));
        if (equal(ticketInfo[from_userId][ticketId].userId, "")) ticketInfo[to_userId][ticketId] = (Info(to_userId, ticketId, transactionId, false));
        delete ticketInfo[from_userId][ticketId];
        transactionRec[transactionId] = (TxRec(from_userId, to_userId, ticketId, transactionId));
        Transfer(from_userId, to_userId, ticketId, transactionId);
        return (ticketInfo[from_userId][ticketId].userId, ticketInfo[from_userId][ticketId].ticketId, ticketInfo[from_userId][ticketId].transactionId);
    }

    function add(string to_userId, string ticketId, string transactionId) onlyowner returns(string, string, string) {
        require (! equal(transactionRec[transactionId].transactionId, transactionId));
        ticketInfo[to_userId][ticketId] = (Info(to_userId, ticketId, transactionId, false));
        transactionRec[transactionId] = (TxRec("", to_userId, ticketId, transactionId));
        Transfer("", to_userId, ticketId, transactionId);
        return (ticketInfo[to_userId][ticketId].userId, ticketInfo[to_userId][ticketId].ticketId, ticketInfo[to_userId][ticketId].transactionId);
    }

    function getTicketDetail(string userId, string ticketId) constant returns(string, string, string, bool) {
        return (ticketInfo[userId][ticketId].userId, ticketInfo[userId][ticketId].ticketId, ticketInfo[userId][ticketId].transactionId, ticketInfo[userId][ticketId].isAttend);
    }
    
    /// @dev Does a byte-by-byte lexicographical comparison of two strings.
    /// @return a negative number if `_a` is smaller, zero if they are equal
    /// and a positive numbe if `_b` is smaller.
    function compare(string _a, string _b) returns(int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i++)
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
            return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }

    /// @dev Compares two strings and returns true iff they are equal.
    function equal(string _a, string _b) returns(bool) {
        return compare(_a, _b) == 0;
    }
}