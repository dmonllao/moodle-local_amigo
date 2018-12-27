define(['jquery', 'core/config', 'core/url', 'core/ajax', 'local_amigo/idle',
            'core/notification', 'local_amigo/aes', 'local_amigo/core'],
        function($, config, Url, Ajax, Idle,
            MoodleNotification, AES, CryptoJS) {

    var TRACK_INTERVAL = 1000;

    var NOTIFICATION_TIMEOUT = 7000;

    // TODO This lock should be unique to this Moodle site.
    var SESSION_STORAGE_PREFIX = 'localamigo';

    var Amigo = function Amigo(pokes, config, timeInfo, user, site) {

        this.pokes = pokes;
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
        this.site = site;

        this.idle = new Idle();

        if (this.pokes.length < 1) {
            // It is not worth tracking the user activity across the session
            // if no pokes will be generated.
            return;
        }

        if (!("Notification" in window)) {
            window.console.log("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === "denied") {
            // TODO Send a reminder: "Activate notifications mate" through MoodleNotification.
            return;
        }

        // TODO Multi-tab support
        // Disable the amigo when there are multiple tabs opened.
        // if (!this.processLock()) {
        //     return;
        // }

        // Store the page layout.
        // var bodyClasses = $('body').attr('class').split(' ');
        // for (var i in bodyClasses) {
        //     if (bodyClasses[i].match(/^pagelayout-/)) {
        //         this.currentView.pageLayout = bodyClasses[i].substr(11);
        //     }
        // }

        // Store the page.
        this.currentView.pageId = $('body').attr('id');

        // Remove pokes whose targets are not this page. We will still track user activity
        // as future visited pages in this same session might need this information.
        var i = this.pokes.length;
        while (i--) {
            if (typeof this.pokes[i].getTargetPages !== "undefined") {
                var targetPages = this.pokes[i].getTargetPages();

                var matches = false;
                for (var j in targetPages) {
                    var regex = new RegExp(targetPages[j]);
                    if (this.currentView.pageId.match(regex)) {
                        matches = true;
                        break;
                    }
                }
                if (matches == false) {
                    // Remove this poke.
                    this.pokes.splice(i, 1);
                }
            }
        }

        // Register pokes' callbacks.
        for (var i in this.pokes) {
            this.callbacks.push(this.pokes[i].getCallback());
        }

        // Start the activity tracker.
        this.timeTracker = setInterval(this.trackActive.bind(this), TRACK_INTERVAL);

        if (Notification.permission !== "granted") {
            Notification.requestPermission()
                .then(function(permission) {
                    if (permission === "granted" && this.user.introshowed != 1) {
                        // Brief explanation about the tool.
                        this.sendNotification('Hi from Chuck', 'Hello, I am your personal moodle-amigo.');
                    }
                    this.done();
                }.bind(this)
                .fail(MoodleNotification.exception)
            );
        }

        // Retrieve past viewed pages in this session, DESC sorting.
        this.previousViews = this.getPreviousViews();
        window.console.log(this.previousViews);
    };

    Amigo.prototype.config = {};
    Amigo.prototype.timeInfo = {};
    Amigo.prototype.user = {};
    Amigo.prototype.site = {};

    Amigo.prototype.idle = false;

    Amigo.prototype.pokes = [];
    Amigo.prototype.callbacks = [];

    Amigo.prototype.currentView = {
        pageId: null,
        counterActive: 0,
        counterLastActive: 0,
        counterInactive: 0,
        counterLastInactive: 0,
        counterIdle: 0,
    };
    Amigo.prototype.previousViews = [];

    Amigo.prototype.lastState = null;

    /**
     * @var {Notification} notification
     * @private
     */
    Amigo.prototype.notification = null;

    /**
     * @var {intervalID} timeTracker
     * @private
     */
    Amigo.prototype.timeTracker = null;

    Amigo.prototype.trackActive = function trackActive() {

        // Avoid race conditions (no counters until permission has been granted).
        if (Notification.permission !== "granted") {
            this.done();
            return;
        }

        var isActive = document.hasFocus();
        var isIdle = this.idle.isIdle();

        if (isActive) {
            this.currentView.counterActive++;
            this.currentView.counterLastActive++;
        } else {
            this.currentView.counterInactive++;
            this.currentView.counterLastInactive++;
        }

        if (isIdle) {
            this.currentView.counterIdle++;
        } else {
            this.currentView.counterIdle = 0;
        }

        window.console.log('Active: ' + this.currentView.counterActive +
                    ' Active last: ' + this.currentView.counterLastActive +
                    ' Inactive: ' + this.currentView.counterInactive +
                    ' Inactive last: ' + this.currentView.counterLastInactive +
                    ' Idle: ' + this.currentView.counterIdle);

        for (var i in this.callbacks) {

            var notificationData = this.callbacks[i](this.currentView, isActive, isIdle);
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

        if (isActive === true && this.lastState === false) {
            this.currentView.counterLastActive = 0;
        } else if (isActive === false && this.lastState === true) {
            this.currentView.counterLastInactive = 0;
        }

        // Update the last state.
        this.lastState = isActive;

        // Update the session history data with this last page view numbers.
        // TODO We might want to save every few iterations instead of after each iteration.
        this.storeSessionViews();
    };

    Amigo.prototype.done = function done() {
        clearInterval(this.timeTracker);
    };

    Amigo.prototype.sendNotification = function sendNotification(title, body, pokeKey, clickCallback) {

        // TODO Desktop notifications should only be used when the window does not have
        // the focus, a web notification should be used if the window has the focus.
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

    // TODO Multi-tab support. Explore setInterval possibility
    //
    // Amigo.prototype.processLock = function processLock() {

    //     var lock = localStorage.getItem(SESSION_STORAGE_PREFIX + 'lock');
    //     console.log(lock);
    //     if (lock) {
    //         return false;
    //     }

    //     $(window).on('unload', function() {
    //         // Free the lock.
    //         localStorage.removeItem(SESSION_STORAGE_PREFIX + 'lock');
    //     });

    //     localStorage.setItem(SESSION_STORAGE_PREFIX + 'lock', true);
    //     return true;
    // };

    Amigo.prototype.getPreviousViews = function getPreviousViews() {

        var encodedViews = sessionStorage.getItem(SESSION_STORAGE_PREFIX + 'views');
        if (encodedViews) {
            var prevViews = AES.decrypt(encodedViews, config.sesskey);
            try {
                return JSON.parse(prevViews.toString(CryptoJS.enc.Utf8));
            } catch (exception) {
                // Clear sessionStorage contents if there is no match using the current user sesskey.
                sessionStorage.removeItem(SESSION_STORAGE_PREFIX + 'views');
            }
        }

        return [];
    };

    Amigo.prototype.storeSessionViews = function storeSessionViews() {
        // Encrypt the session stream using the user sesskey to prevent other users
        // from accessing users' session stream.
        var str = JSON.stringify([this.currentView].concat(this.previousViews));
        sessionStorage.setItem(SESSION_STORAGE_PREFIX + 'views', AES.encrypt(str, config.sesskey).toString());
    };

    return {
        init: function(activePokes, config, timeInfo, user, site) {

            var promises = [];
            var pokes = [];

            for (var key in activePokes) {
                // TODO Support other components' pokes.
                // moduleName exists in this block scope so it should be ok to call a function inside a loop
                var moduleName = 'local_amigo/poke_' + key;

                // Lazy-loading pokes.
                promises.push($.Deferred());
                require([moduleName], function(pokemodule) {

                    // Note that pokemodule is a dynamic name.
                    pokes.push(new pokemodule(config, timeInfo, user, site));
                    promises.pop().resolve(moduleName);
                });
            }

            // Init our beloved amigo once all poke AMD modules are loaded.
            $.when.apply($, promises).then(function() {
                new Amigo(pokes, config, timeInfo, user, site);
            });
        }
    };
});

