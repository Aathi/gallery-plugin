
export default Ember.Component.extend({
  classNames: ['facebook-video'],
  url: '',

  loadFB: function() {
    if(window.FB) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        resolve(window.FB);
      });
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3";
        js.onload = function() {
         resolve(window.FB);
        }
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    });
  },

  onDidInsertElement: function() {
    this.loadFB().then(() => {
      Ember.run.schedule('afterRender', this, function() {
        FB.XFBML.parse(this.$()[0]);
      });
    });
  }.on('didInsertElement')
});
