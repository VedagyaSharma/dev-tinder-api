const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.resolveSrv(
    "_mongodb._tcp.namastenode.mvbbteq.mongodb.net",
    (err, records) => {
        console.log("ERROR:", err);
        console.log("RECORDS:", records);
    }
);