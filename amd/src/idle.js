define(function() {

    var ACTIVE_GRACE_PERIOD = 2000;

    var Idle = function Idle() {

        // TODO Just is just too much, set listeners on and off every
        // time active is called or something like this.
        window.addEventListener('click', this.active.bind(this), {passive: true});
        window.addEventListener('mousemove', this.active.bind(this), {passive: true});
        window.addEventListener('mouseenter', this.active.bind(this), {passive: true});
        window.addEventListener('keydown', this.active.bind(this), {passive: true});
        window.addEventListener('scroll', this.active.bind(this), {passive: true});
        window.addEventListener('mousewheel', this.active.bind(this), {passive: true});
        window.addEventListener('touchmove', this.active.bind(this), {passive: true});
        window.addEventListener('touchstart', this.active.bind(this), {passive: true});

        setInterval(this.checkInactive.bind(this), ACTIVE_GRACE_PERIOD);
    };

    Idle.prototype.idle = false;
    Idle.prototype.lastActive = 0;

    Idle.prototype.active = function active() {
        this.idle = false;
        this.lastActive = new Date().getTime();
    };

    Idle.prototype.checkInactive = function checkInactive() {
        var now = new Date().getTime();
        if (this.lastActive + ACTIVE_GRACE_PERIOD < now) {
            this.idle = true;
        }
    };

    Idle.prototype.isIdle = function isIdle() {
        return this.idle;
    };

    return Idle;
});

