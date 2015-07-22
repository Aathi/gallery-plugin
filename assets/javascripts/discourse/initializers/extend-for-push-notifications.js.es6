import ComposerController from 'discourse/controllers/composer';

const { isNone, computed } = Ember;

let getFirebaseURL = function(discourseTopicUrl) {
  return discourseTopicUrl.split('/').slice(-2).join('_');
};

let removeUndefinedObjVals = function(obj) {
  Object.keys(obj).forEach(function(key) {
    if(isNone(obj[key])) {
      delete obj[key];
    }
  });
  return obj;
};

export default {
  name: 'extend-for-push-notifications',
  initialize(container, application) {
    ComposerController.reopen({
      tamilhub: Ember.inject.service(),
      isEdit: computed.notEmpty('topic.id'),

      canEditTags: computed('model.canEditTitle', 'model.creatingPrivateMessage', function() {
        var currentUser = Discourse.User.current();
        return (currentUser && (currentUser.get('admin') || currentUser.get('staff'))) &&
               !this.site.mobileView &&
               this.get('model.canEditTitle') &&
               !this.get('model.creatingPrivateMessage');
      }),

      pushToFirebase(firebase_notification_url, data) {
        return this.get('tamilhub').save('/pushnotifications/' + firebase_notification_url, removeUndefinedObjVals(data));
      },

      actions: {
        save() {
          let push_to_firebase = this.get('push_to_firebase');
          let notification_message = this.get('notification_message');
          let firebase_notification_url;
          let discourse_topic_url;

          this.save().then((json) => {
            if(!this.get('isEdit')) {
              if(push_to_firebase) {
                discourse_topic_url = window.location.href;
                firebase_notification_url = getFirebaseURL(discourse_topic_url);

                this.pushToFirebase(firebase_notification_url, {
                  notification_url: discourse_topic_url,
                  notification_message: notification_message
                });
              }
            } else {
              discourse_topic_url = window.location.protocol + '//' + window.location.host + '/t/' + this.get('topic.slug') + '/' + this.get('topic.id');
              firebase_notification_url = getFirebaseURL(discourse_topic_url);

              if(push_to_firebase) {
                this.pushToFirebase(firebase_notification_url, {
                  notification_url: discourse_topic_url,
                  notification_message: notification_message
                });
              } else {
                this.get('tamilhub').remove('/pushnotifications/' + firebase_notification_url);
              }
            }
          });
        }
      }
    })
  }
};
