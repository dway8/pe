const winston = require("winston");
const Transport = require("winston-transport");
const { MESSAGE } = require("triple-beam");
const { IncomingWebhook } = require("@slack/client");

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
class Slack extends Transport {
    constructor(opts) {
        super(opts);

        this.url = opts.url;
        this.channel = opts.channel;

        this.webhook = new IncomingWebhook(this.url, {
            channel: this.channel,
        });
    }

    log(info, callback) {
        const output = info[MESSAGE];

        // Perform the writing to the remote service
        //
        try {
            // Send simple text to the webhook channel
            this.webhook.send(output, function (err, _res) {
                if (err) {
                    //this.emit('error', err);
                    callback(null, false);
                } else {
                    //this.emit('logged', info);
                    callback(null, true);
                }
            });
        } catch (err) {
            //this.emit('error', err);
            callback(null, false);
        }
    }
}

winston.transports.Slack = Slack;

module.exports = {
    Slack,
};
