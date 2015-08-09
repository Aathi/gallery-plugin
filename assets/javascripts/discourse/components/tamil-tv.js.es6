let isBlank = Ember.isBlank;

const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

export default Ember.Component.extend({
  classNames: ['primary-tv'],

  url: null,
  post: null,
  isYTVideo: false,
  autoPlay: true,
  tvSource: 'http://tv-streamer-lon-01.orutv.com/broadcast.m3u8',

  showLogin: 'showLogin',

  videoParentId: function() {
    return 'gallery-' + this.elementId;
  }.property('elementId'),

  initializeClappr: function() {
    let url = this.get('url');

    Ember.run.scheduleOnce('afterRender', this, function() {
      if(this.get('isYTVideo')) {
        let $yt = $(this.get('url'));

        $yt.attr({
          'data-width': '100%',
          'data-height': '300',
          'data-parameters': "autoplay=0"
        });

        let lazyYTContainer = $('#' + this.get('videoParentId')).append($yt);
        let lazyYT = $('.lazyYT', lazyYTContainer);
        lazyYT.lazyYT();

        $yt.css({
          'padding-bottom': '46.25%'
        });

        $('.ytp-thumbnail', lazyYTContainer).click();
      } else {
        let playerElement = this.$('#' + this.get('videoParentId'));

        if(Discourse.Mobile.mobileView || isSafari) {
          this.initializeJWPlayer();
        } else {
          let player = new Clappr.Player({
            source: this.get('tvSource'),
            plugins: { playback: [P2PHLS] }, // container: [P2PHLSStats] },
            width: '100%',
            height: '616px',
            autoPlay: this.get('autoPlay')
          });

          player.attachTo(playerElement);

          this.checkClapprCompatibility().catch((error) => {
            this.initializeJWPlayer();
          });
        }
      }
    });
  }.on('didInsertElement'),

  checkClapprCompatibility: function() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.onerror = function errorHandler(msg, url, line) {
        try {
          var error = new Error();
          throw error;
        } catch (error) {
          var stack = error.stack;
          if(stack.indexOf('checkClapprCompatibility') !== -1) {
            reject(error);
          }
        }
      }
      $('div[data-poster].player-poster').click()
    });
  },

  initializeJWPlayer: function() {
    jwplayer(this.get("videoParentId")).setup({
      file: this.get('tvSource'),
      width: '100%',
      aspectratio: '16:9',
      skin: 'vapor',
      autostart: 'true',
    });
  },

  urlDidChange: function() {
    this.rerender();
  }.observes('url'),

  actions: {
    playTamilTV() {
      this.setProperties({
        isYTVideo: false,
        post: null,
        topic: null,
        url: null
      });
    },

    showLogin() {
      this.sendAction('showLogin');
    }
  }
})
