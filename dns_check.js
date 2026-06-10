const dns = require("node:dns");

console.log("Servers:", dns.getServers());

require("node:dns").lookup("google.com", console.log);

/*
    What you learned (valuable debugging lesson)

    You followed a senior-level debugging path:

    Verified Atlas cluster.
    Verified SRV records via nslookup.
    Tested MongoDB Compass.
    Reduced to a minimal dns.resolveSrv() script.
    Proved DNS works when forced.
    Inspected Windows DNS configuration.
    Isolated runtime behavior.
    Swapped Node versions.
    Confirmed regression in Node 24.

    That's exactly how you'd debug an infrastructure issue in a real Node/NestJS team.
*/