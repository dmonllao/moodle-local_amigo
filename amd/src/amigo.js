
define(['jquery', 'core/url'], function($, Url) {

    var INTERVAL = 1000;

    var Amigo = function Amigo(config, usertime) {
        console.log(config);
        console.log(usertime);

        this.config = config;
        this.usertime = usertime;

        this.timeTracker = setInterval(this.trackActive.bind(this), INTERVAL);
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        Notification.requestPermission().then(function(result) {
            permission = result;
            if (result === "denied") {
                clearInterval(timeTracker);
            }
        });
    };

    Amigo.prototype.config = {};
    Amigo.prototype.usertime = {};

    Amigo.prototype.counterActive = 0;
    Amigo.prototype.counterInactive = 0;
    Amigo.prototype.counterLastInactive = 0;
    Amigo.prototype.lastState;

    /**
     * @var {Notification} notification
     * @private
     */
    Amigo.prototype.notification;

    /**
     * @var {intervalID} timeTracker
     * @private
     */
    Amigo.prototype.timeTracker;


    Amigo.prototype.trackActive = function trackActive() {

        // Avoid race conditions (no counters until permission has been granted).
        if (permission !== "granted") {
            return;
        }

        focused = document.hasFocus();

        if (focused) {
            this.counterActive++;
        } else {
            this.counterInactive++;
            this.counterLastInactive++;
        }

        console.log('Active secs: ' + this.counterActive + ' inactive secs: ' +
                    this.counterInactive + ' last inactive period: ' +
                    this.counterLastInactive);

        if (focused == true && this.lastState == false) {
            // Back home.
            //this.sendNotification('welcome back');
        } else if (focused == false && this.lastState == true) {
            //this.sendNotification('you are leaving!');
            this.counterLastInactive = 0;
        }

        if (this.counterLastInactive > 3) {
            this.sendNotification('Moodle amigou message', 'Hey mate, close the facebook tab and return to your studies.');
        }

        // Update the last state.
        this.lastState = focused;
    };

    Amigo.prototype.done = function done() {
        clearInterval(this.timeTracker);
    };

    Amigo.prototype.sendNotification = function sendNotification(title, body) {

        if (typeof body == "undefined") {
            body = 'no body today';
        }

        if (this.notification && typeof notification.close === 'function') {
            this.notification.close();
        }
        this.notification = new Notification(title, {
            'icon': Url.relativeUrl('local/amigo/pix/chuck.jpg'),
            'body': body,
        });
        this.notification.onclick = function(ev) {
            event.preventDefault();

            // TODO This should be a callback, it depends on the ping.
            window.focus();
            this.notification.close();
        }.bind(this);

        this.done();
    };

    return {
        init: function(config, usertime) {
            new Amigo(config, usertime);
        }
    };
});

