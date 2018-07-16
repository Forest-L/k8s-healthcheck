const https = require('https')
var fs = require("fs");

module.exports = class CustomAppMonitor {

    constructor() {
        this.name = "k8s api-server monitor";
    }

    getHealth() {
        return new Promise(function (resolve, reject) {
            try {
                const bearerTokenDir = "/var/run/secrets/kubernetes.io/serviceaccount/token";

                const bearerToken = fs.readFileSync(bearerTokenDir, 'utf8');
        
                const requestOptions = {
                    path: '/', // api-server health endpoint.
                    host: 'kubernetes', // this is routed to api-server by kube-dns.
                    ca: [fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt')], // the api-server cert stored by default on each pod
                    rejectUnauthorized: true, // reject the response if we can't validate the ssl cert.
                    agent: false,
                    headers: { 'Authorization': "Bearer " + bearerToken }
                };
    
                var req = https.request(requestOptions, function (res) {
                    if (res.statusCode !== 200) {
                        return resolve(false);
                    } else {
                        return resolve(true);
                    }
                });
    
                // on request error, reject
                req.on('error', function(err) {
                    console.error(err);
                    return resolve(false);
                });
                
                // if there's post data, write it to the request
                req.end()
            }
            catch(err) {
                console.error(err);
                return resolve(false);
            }
        });
    }
}