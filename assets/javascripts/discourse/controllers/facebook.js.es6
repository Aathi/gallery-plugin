import Ember from 'ember';

const TAMILTVPAGE_ID = '1567905173450273';

export default Ember.Object.extend({
  loadFB(options) {
    if(FB) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        resolve();
      });
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.fbAsyncInit = function() {
        FB.init({
          appId: '480494582120057',
          xfbml: false,
          version: 'v2.4'
        });

        resolve(FB);
      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    });
  },

  login() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      FB.login(function(response) {
        if(Ember.isNone(response.authResponse)) {
          reject(response);
        } else {
          resolve(response);
        }
       }, {
         scope: 'manage_pages,publish_pages,publish_actions',
         auth_type: 'rerequest',
         return_scopes: true
       });
    });
  },

  getUserAccessToken() {
    if(this.get('userAccessToken')) {
      return new Ember.RSVP.Promise((resolve) => {
        resolve(this.get('userAccessToken'));
      });
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
          this.setProperties({
            uid: response.authResponse.userID,
            userAccessToken: response.authResponse.accessToken
          });

          resolve(response.authResponse.accessToken);
        } else if (response.status === 'not_authorized') {
          // the user is logged in to Facebook,
          // but has not authenticated your app
        } else {
          return this.login().then((response) => {
            resolve(response.authResponse.accessToken);
          });
        }
      });
    });
  },

  getPageAccessToken() {
    var self = this;
    return this.getUserAccessToken().then((userAccessToken) => {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        FB.api('/me/accounts', {
          access_token: userAccessToken
        }, function(response) {
          if (response && response.error) {
            console.error(response.error);
          } else {
            var pages = response.data;
            var tamilTVPage = pages.findBy('id', TAMILTVPAGE_ID);
            var pageAccessToken = tamilTVPage.access_token;
            self.set('pageAccessToken', pageAccessToken)
            resolve(pageAccessToken);
          }
        });
      });
    });
  },

  _share(options) {
    var self = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      FB.api('/' + TAMILTVPAGE_ID + '/feed', 'POST', {
        access_token: self.get('pageAccessToken'),
        message: options.message,
        link: options.link
      }, function (response) {
        if (response && response.error) {
          if(response.error.code === 200) {
            return self.login().then(function(response) {
              return self._share(options);
            });
          } else {
            console.error(response.error);
          }
          /* handle the result */
        } else {
          resolve(response);
        }
      });
    });
  },

  share(options) {
    return this.loadFB().then(() => {
      return this.getPageAccessToken().then(() => {
        return this._share(options);
      });
    });
  }
});
