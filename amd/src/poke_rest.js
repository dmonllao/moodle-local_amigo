define(['jquery', 'local_amigo/page_parser'], function($, PageParser) {

    var TARGET_PAGES = ['page-mod-book-view', 'page-mod-page-view'];

    var PokeRest = function PokeRest(config, timeInfo, user) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
    };

    PokeRest.prototype.config = {};
    PokeRest.prototype.timeInfo = {};
    PokeRest.prototype.user = {};

    PokeRest.prototype.getCallback = function getCallback() {
        return function(currentView, focused, lastState) {
            for (i in TARGET_PAGES) {
                if ($('body').attr('id') == TARGET_PAGES[i]) {

                    wordCount = PageParser.mainRegionWordCount();
                    if (currentView.counterActive > 20 && wordCount > 200) {
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
                }
            }
            return false;
        }.bind(this);
    }

    return PokeRest;
});

