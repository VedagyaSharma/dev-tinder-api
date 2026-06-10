const dns = require("node:dns");

dns.resolveSrv(
    "_mongodb._tcp.namastenode.mvbbteq.mongodb.net",
    (err, records) => {
        console.log("ERROR:", err);
        console.log("RECORDS:", records);
    }
);

// The problem is that Node.js is not using the same DNS resolver that Windows is showing in ipconfig.

// Something on the machine (often VPN/TAP software, Winsock providers, router DNS proxy, security software) is causing Node's default DNS path to fail for SRV records.