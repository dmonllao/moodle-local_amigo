
define(['jquery', 'core/url', 'core/ajax', 'core/notification'], function($, Url, Ajax, MoodleNotification) {

    var INTERVAL = 1000;

    var NOTIFICATION_TIMEOUT = 5000;

    var Amigo = function Amigo(pokes, config, usertime, userid) {
        console.log(pokes);
        console.log(config);
        console.log(usertime);
        console.log(userid);

        this.pokes = pokes;
        this.config = config;
        this.usertime = usertime;
        this.userid = userid;

        if (this.pokes.length < 1) {
            return;
        }

        // Register pokes' callbacks.
        for (var i in this.pokes) {
            this.callbacks.push(this.pokes[i].getCallback());
        }

        this.timeTracker = setInterval(this.trackActive.bind(this), INTERVAL);
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        Notification.requestPermission().then(function(result) {
            permission = result;
            if (result === "denied") {
                this.done();
            }
        });
    };

    Amigo.prototype.pokes = [];
    Amigo.prototype.config = {};
    Amigo.prototype.usertime = {};
    Amigo.prototype.userid;

    Amigo.prototype.callbacks = [];

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
            this.done();
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

        for (var i in this.callbacks) {
            var match = this.callbacks[i](focused, this.counterActive, this.counterInactive,
                this.counterLastInactive, this.lastState);
            if (match) {
                this.sendNotification(match[0], match[1], match[2], match[3]);
                break;
            }
        }

        // if (focused == true && this.lastState == false) {
        //     // Back home.
        //     //this.sendNotification('welcome back');
        // } else if (focused == false && this.lastState == true) {
        //     //this.sendNotification('you are leaving!');
        //     this.counterLastInactive = 0;
        // }

        // Update the last state.
        this.lastState = focused;
    };

    Amigo.prototype.done = function done() {
        clearInterval(this.timeTracker);
    };

    Amigo.prototype.sendNotification = function sendNotification(pokeKey, title, body, clickCallback) {

        if (typeof body == "undefined") {
            body = '';
        }

        if (this.notification && typeof this.notification.close === 'function') {
            this.notification.close();
        }

        // New notification.
        this.notification = new Notification(title, {
            'icon': Url.relativeUrl('local/amigo/pix/chuck.jpg'),
            'body': body,
        });

        // The action on-click depends on the poke.
        this.notification.onclick = function(ev) {
            ev.preventDefault();

            // Execute the click callback in Amigo-class context.
            if (clickCallback) {
                clickCallback.bind(this)();
            }

            // Close the notification.
            this.notification.close();

        }.bind(this);

        // Close the notification after NOTIFICATION_TIMEOUT.
        setTimeout(this.notification.close.bind(this), NOTIFICATION_TIMEOUT);

        this.storeLastPoke(pokeKey);

        // No more pokes during on this page view.
        this.done();
    };

    Amigo.prototype.storeLastPoke = function storeLastPoke(pokeKey) {
        var now = new Date();
        Ajax.call([{
            methodname: 'core_user_set_user_preferences',
            args: {
                preferences: [
                    {
                        'name': 'local_amigo_last_poke_' + pokeKey,
                        'value': Math.round(now.getTime() / 1000),
                        'userid': this.userid,
                    }
                ]
            },
            fail: MoodleNotification.exception
        }]);
    };

    return {
        init: function(activePokes, config, usertime, userid) {

            var promises = [];
            var pokes = [];

            for (key in activePokes) {
                // TODO Support other components' pokes.
                moduleName = 'local_amigo/poke_' + key;

                // Lazy pokes loading.
                promises.push(
                    require([moduleName], function(pokeModule) {
                        pokes.push(new pokeModule(config, usertime, userid));
                    })
                );
            }

            // Init our beloved amigo once all poke AMD modules are loaded.
            console.log('promises:');
            console.log(promises);
            $.when(promises).then(function() {
                new Amigo(pokes, config, usertime, userid);
            });
        }
    };
});

