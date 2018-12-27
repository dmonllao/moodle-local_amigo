define(['jquery', 'local_amigo/page_parser'], function($, PageParser) {

    // TODO Set up a realistic time.
    var POKE_AFTER = 20;

    // In words.
    var MIN_CONTENT_LENGTH = 200;

    var PokeRest = function PokeRest(config, timeInfo, user, site) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
        this.site = site;
    };

    PokeRest.prototype.config = {};
    PokeRest.prototype.timeInfo = {};
    PokeRest.prototype.user = {};
    PokeRest.prototype.site = {};

    PokeRest.prototype.getCallback = function getCallback() {
        return function(currentView, isActive, isIdle) {

            if (!isActive || isIdle) {
                return false;
            }

            wordCount = PageParser.mainRegionWordCount();
            if (currentView.counterActive > POKE_AFTER && wordCount > MIN_CONTENT_LENGTH) {
                return [
                    'Hey Mate!',
                    'You have been reading for a long time. ' +
                        'It has been observed that when people try to read for ' +
                        'long hours, they seldom are able to grasp concepts. ' +
                        'But having spent some time reading gives them a false sense of ' +
                        'understanding. Don\'t you feel like resting for a while?',
                    'rest',
                    null,
                ];
            }
            return false;
        }.bind(this);
    }

    PokeRest.prototype.getTargetPages = function getTargetPages() {
        return ['page-mod-book-view', 'page-mod-page-view'];
    };

    return PokeRest;
});

