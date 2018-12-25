
define(['jquery', 'core/config', 'core/url', 'core/ajax', 'core/notification', 'local_amigo/aes', 'local_amigo/core'],
        function($, config, Url, Ajax, MoodleNotification, AES, CryptoJS) {

    var TRACK_INTERVAL = 1000;

    var NOTIFICATION_TIMEOUT = 7000;

    var Amigo = function Amigo(pokes, config, timeInfo, user) {

        this.pokes = pokes;
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;

        if (this.pokes.length < 1) {
            return;
        }

        // Register pokes' callbacks.
        for (var i in this.pokes) {
            this.callbacks.push(this.pokes[i].getCallback());
        }

        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        this.timeTracker = setInterval(this.trackActive.bind(this), TRACK_INTERVAL);

        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(function(result) {
                permission = result;
                if (result === "granted") {
                    // Brief explanation about the tool.
                    this.sendNotification('Hi from Chuck', 'Hello, I am your personal moodle-amigo.');
                }
                this.done();
            }.bind(this));
        }

        // Store the page.
        this.currentView.pageId = $('body').attr('id');

        // Store the page layout.
        $('body').attr('class').split(' ').forEach(function(value) {
            if (value.match(/^pagelayout-/)) {
                this.currentView.pageLayout = value.substr(11);
            }
        }.bind(this));

        // Retrieve past viewed pages in this session, DESC sorting.
        this.previousViews = this.getPreviousViews();
        console.log(this.previousViews);
    };

    Amigo.prototype.config = {};
    Amigo.prototype.timeInfo = {};
    Amigo.prototype.user = {};

    Amigo.prototype.pokes = [];
    Amigo.prototype.callbacks = [];

    Amigo.prototype.currentView = {
        pageId: null,
        counterActive: 0,
        counterLastActive: 0,
        counterInactive: 0,
        counterLastInactive: 0,
    };
    Amigo.prototype.previousViews = [];

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
        if (Notification.permission !== "granted") {
            this.done();
            return;
        }

        focused = document.hasFocus();

        if (focused) {
            this.currentView.counterActive++;
            this.currentView.counterLastActive++;
        } else {
            this.currentView.counterInactive++;
            this.currentView.counterLastInactive++;
        }

        console.log('Active: ' + this.currentView.counterActive +
                    ' Active last: ' + this.currentView.counterLastActive +
                    ' Inactive: ' + this.currentView.counterInactive +
                    ' Inactive last: ' + this.currentView.counterLastInactive);

        for (var i in this.callbacks) {

            var notificationData = this.callbacks[i](this.currentView, focused, this.lastState);
            if (notificationData) {
                this.sendNotification(notificationData[0], notificationData[1], notificationData[2], notificationData[3]);

                // Store a timestamp associated to the generated poke.
                if (notificationData[2]) {
                    this.storeLastPoke(notificationData[2]);
                }

                // No more pokes during on this page view.
                this.done();

                return;
            }
        }

        if (focused == true && this.lastState == false) {
            this.currentView.counterLastActive = 0;
        } else if (focused == false && this.lastState == true) {
            this.currentView.counterLastInactive = 0;
        }

        // Update the last state.
        this.lastState = focused;

        // Update the session history data with this last page view numbers.
        // TODO We might want to save every few iterations instead of after each iteration.
        this.storeSessionViews();
    };

    Amigo.prototype.done = function done() {
        clearInterval(this.timeTracker);
    };

    Amigo.prototype.sendNotification = function sendNotification(title, body, pokeKey, clickCallback) {

        if (typeof body == "undefined") {
            body = '';
        }

        if (this.notification && typeof this.notification.close === 'function') {
            this.notification.close();
        }


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

        // Automatically close it after a while.
        setTimeout(this.notification.close.bind(this.notification), NOTIFICATION_TIMEOUT);
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
                        'userid': this.user.id,
                    }
                ]
            },
            fail: MoodleNotification.exception
        }]);
    };

    Amigo.prototype.getPreviousViews = function getPreviousViews() {

        var encodedViews = sessionStorage.getItem('views');
        if (encodedViews) {
            var prevViews = AES.decrypt(encodedViews, config.sesskey);
            try {
                return JSON.parse(prevViews.toString(CryptoJS.enc.Utf8));
            } catch (exception) {
                // Clear sessionStorage contents if there is no match using the current user sesskey.
                sessionStorage.removeItem('views');
            }
        }

        return [];
    };

    Amigo.prototype.storeSessionViews = function storeSessionViews() {
        var str = JSON.stringify([this.currentView].concat(this.previousViews));
        sessionStorage.setItem('views', AES.encrypt(str, config.sesskey).toString());
    };

    return {
        init: function(activePokes, config, timeInfo, user) {

            var promises = [];
            var pokes = [];

            for (key in activePokes) {
                // TODO Support other components' pokes.
                moduleName = 'local_amigo/poke_' + key;

                // Lazy-loading pokes.
                promises.push($.Deferred());
                require([moduleName], function(pokemodule) {
                    pokes.push(new pokemodule(config, timeInfo, user));
                    promises.pop().resolve(moduleName);
                });
            }

            // Init our beloved amigo once all poke AMD modules are loaded.
            $.when.apply($, promises).then(function() {
                new Amigo(pokes, config, timeInfo, user);
            });
        }
    };
});

