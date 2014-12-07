// Basicially the client and the server will call init first.

domain.assign('init', function(rawSession) {
    if(isServer) {
        // Server code here...
        var map = new Map(10, 10);
        var session = new Session(true, map, domain);
        // TODO load systems and entities
        return session;
    } else {
        // Client code here...
        var session = null;
    }
});
