import ComposerController from 'discourse/controllers/composer';

const { isNone, computed, get, isBlank } = Ember;

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
      fb: Ember.inject.service('facebook'),

      topicController: Ember.inject.controller('topic'),
      isEdit: computed.notEmpty('topic.id'),

      canEditTags: computed('model.canEditTitle', 'model.creatingPrivateMessage', function() {
        var currentUser = Discourse.User.current();
        return (currentUser && (currentUser.get('admin') || currentUser.get('staff'))) &&
               !this.site.mobileView &&
               this.get('model.canEditTitle') &&
               !this.get('model.creatingPrivateMessage');
      }),

      pushNotificationToFirebase(firebase_notification_url, data) {
        return this.get('tamilhub').save('/pushnotifications/' + firebase_notification_url, removeUndefinedObjVals(data));
      },

      pushVideoToFirebase(firebase_notification_url, data) {
        return this.get('tamilhub').save('/tvvideos/' + firebase_notification_url, removeUndefinedObjVals(data));
      },

      createFirebaseTag(tag) {
        return this.get('tamilhub').push('/tags', removeUndefinedObjVals(tag));
      },

      updateFirebaseTag(url, data) {
        return this.get('tamilhub').update('/tags/' + url, removeUndefinedObjVals(data));
      },

      pushVideoAndUpdateTag(firebase_notification_url, data, tag) {
        data.tag = tag.id;
        this.pushVideoToFirebase(firebase_notification_url, data).then(() => {
          let programme = {};
          programme[firebase_notification_url] = true;

          this.updateFirebaseTag('/' + tag.id + '/tvvideos', programme);
        });
      },

      pushVideoAndCreateTag(firebase_notification_url, data) {
        let firebaseTags = this.get('topicController.firebaseTags');
        let categoryName = this.get('topic.category.name');
        let todayDate = new Date();

        let tag = {
          name: categoryName,
          created_at: todayDate,
          levelWeightage: 1
        };

        let programme = {};
        programme[firebase_notification_url] = true;

        tag.tvvideos = programme;

        this.createFirebaseTag(tag).then((tag) => {
          data.tag = tag.name();
          this.pushVideoToFirebase(firebase_notification_url, data).then(() => {
            this.get('tamilhub').fetch('/tags/' + data.tag).then((tag) => {
              tag.id = data.tag;
              firebaseTags.pushObject(tag);
            });
          });
        })
      },

      actions: {
        save() {
          let notify_firebase = this.get('notify_firebase');
          let notification_message = this.get('notification_message');
          let push_video_to_firebase = this.get('push_video_to_firebase');
          let video_url = this.get('video_url');
          let firebaseTags = this.get('topicController.firebaseTags');
          let categories = this.get('categories');
          let category = categories.findBy('id', this.get('model.categoryId'));
          let todayDate = new Date();
          let firebase_notification_url;
          let discourse_topic_url;
          let videoTag;

          if(firebaseTags && category) {
            videoTag = firebaseTags.findBy('name', get(category, 'name'));
          }

          if(this.get('facebook.share') && (!isBlank(this.get('facebook.link')) || !isBlank(this.get('facebook.message')))) {
            this.get('fb').share({
              link: this.get('facebook.link'),
              message: this.get('facebook.message')
            });
          }

          this.save().then((json) => {
            let data = {
              video_url: video_url
            };
            if(!this.get('isEdit')) {
              discourse_topic_url = window.location.href;
              firebase_notification_url = getFirebaseURL(discourse_topic_url);

              if(notify_firebase) {
                this.pushNotificationToFirebase(firebase_notification_url, {
                  notification_url: discourse_topic_url,
                  notification_message: notification_message
                });
              }

              if(push_video_to_firebase && !Ember.isBlank(video_url)) {
                if(videoTag) {
                  this.pushVideoAndUpdateTag(firebase_notification_url, data, videoTag);
                } else {
                  this.pushVideoAndCreateTag(firebase_notification_url, data, videoTag);
                }
              }
            } else {
              discourse_topic_url = window.location.protocol + '//' + window.location.host + '/t/' + this.get('topic.slug') + '/' + this.get('topic.id');
              firebase_notification_url = getFirebaseURL(discourse_topic_url);

              if(notify_firebase) {
                this.pushNotificationToFirebase(firebase_notification_url, {
                  notification_url: discourse_topic_url,
                  notification_message: notification_message
                });
              } else {
                this.get('tamilhub').remove('/pushnotifications/' + firebase_notification_url);
              }

              if(push_video_to_firebase && !Ember.isBlank(video_url)) {
                if(videoTag) {
                  this.pushVideoAndUpdateTag(firebase_notification_url, data, videoTag);
                } else {
                  this.pushVideoAndCreateTag(firebase_notification_url, data, videoTag);
                }
              } else {
                this.get('tamilhub').remove('/tvvideos/' + firebase_notification_url);

                if(videoTag) {
                  this.get('tamilhub').remove('/tags/' + videoTag.id + '/tvvideos/' + firebase_notification_url);
                }
              }
            }
          });
        }
      }
    })
  }
};
