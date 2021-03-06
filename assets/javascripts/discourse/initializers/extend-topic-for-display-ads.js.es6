import TopicController from 'discourse/controllers/topic';
import PostView from 'discourse/views/post';
import PostModel from 'discourse/models/post';

const { isEmpty, computed } = Ember;

let getArrayFromFirebaseObject = function(obj) {
  let tmpArray = [];
  Object.keys(obj).forEach(key => {
    var tmpObject = obj[key];
    tmpObject.id = key;
    tmpArray.pushObject(tmpObject);
  });

  return tmpArray;
};

let getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

let getRandomFromArray = function(array) {
  var index = getRandomInt(0, array.length-1);
  return array[index];
};

export default {
  name: 'extend-topic-for-display-ads',
  initialize(container, application) {
    TopicController.reopen({
      canEditTags: computed('model.isPrivateMessage', function() {
        var currentUser = Discourse.User.current();
        return (currentUser && (currentUser.get('admin') || currentUser.get('staff'))) && !this.get('model.isPrivateMessage');
      }),

      tamilhub: Ember.inject.service(),
      tvAds: null,
      firebaseTags: null,

      getRandomAd() {
        var ads = this.get('tvAds') || [];
        return getRandomFromArray(ads);
      },

      fetchTVAds: function() {
        let ads = [];
        this.get('tamilhub').fetch('/tvads').then((json) => {
          if(!isEmpty(json)) {
            ads = getArrayFromFirebaseObject(json);
          }
          this.set('tvAds', ads);
        });
      }.on('init'),

      fetchTags: function() {
        let tags = [];

        this.get('tamilhub').fetch('/tags').then((json) => {
          if((!isEmpty(json))) {
            tags = getArrayFromFirebaseObject(json);
          }
          this.set('firebaseTags', tags);
        });
      }.on('init')
    });

    PostModel.reopen({
      // Extracts the facebook links from the `cooked` string
      oneboxFBLinks: function() {
        var cooked = this.cooked;
        var $cooked = $(cooked);
        var $oneboxlinks = $('a.onebox', $cooked);

        var fbLinks = $.makeArray($oneboxlinks).map(function(oneboxLink) {
          let href = $(oneboxLink).attr('href');

          if(href && href.indexOf('facebook.com')) {
            return href;
          }
        }).compact();

        this.set('_fbLinks', fbLinks);
      }.on('init').observes('updated_at')
    });

    PostView.reopen({
      appendPostAfterCooked: function() {
        Ember.run.scheduleOnce('afterRender', this, function() {
          let topicController = this.get('controller');
          let tvAds = topicController.get('tvAds');

          if(!isEmpty(tvAds) && !Discourse.Mobile.mobileView && this.get("post.firstPost")) {
            let ad = topicController.getRandomAd();
            let adId = this.get('elementId') + '-ad';
            let adImgId = adId + '-img';
            let adLink;
            let adImg;
            let adDOM;

            adLink = '<a id="' + adId + '" target="_blank"></a>';
            adImg = '<img id="' + adImgId + '" /> ';

            adLink = $($.parseHTML(adLink));
            adLink.attr('href', ad.link);

            adImg = $($.parseHTML(adImg));
            adImg.attr('src', ad.src);

            adImg.css({
              width: ad.width,
              height: ad.height,
              'max-width': '100%',
              'margin-top': '20px',
              'margin-bottom': '20px'
            });

            adDOM = adLink.append(adImg);

            this.$('.topic-body').append(adDOM);
          }
        });
      }.on('didInsertElement').observes('controller.tvAds')
    });
  }
};
