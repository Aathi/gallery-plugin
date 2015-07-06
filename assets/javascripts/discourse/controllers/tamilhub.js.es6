import Ember from 'ember';

export default Ember.Object.extend({
  firebaseInstance: 'https://tamilhub.firebaseio.com/',
  ref: null,

  initializeTamilhub: function() {
    let tamilhubRef = new Firebase(this.get('firebaseInstance'));
    this.set('ref', tamilhubRef);
  }.on('init'),

  fetch(url) {
    let urlRef = this.get('ref').child(url);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      urlRef.on('value', function(snapshot) {
        resolve(snapshot.val());
      }, function(error) {
        reject(error);
      });
    });
  },

  save(url, data) {
    let urlRef = this.get('ref').child(url);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      urlRef.set(data, function(error) {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  remove(url) {
    this.save(url, null);
  }
});
