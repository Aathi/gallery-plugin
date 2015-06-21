import DiscoveryCategoriesController from 'discourse/controllers/discovery/categories';
import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories-route';

var get = Ember.get;
var computed = Ember.computed;
var isPresent = Ember.isPresent;

export default function groupBy(collection, property) {
  var dependentKey = collection + '.@each.' + property;

  return computed(dependentKey, function() {
    var groups = [];
    var items = get(this, collection);

    items.forEach(function(item) {
      var value = get(item, property);
      var group = groups.findBy('value', value);

      if (isPresent(group)) {
        get(group, 'items').pushObject(item);
      } else {
        group = { property: property, value: value, items: [item] };
        groups.pushObject(group);
      }
    });

    return groups;
  }).readOnly();
}


export default {
  name: 'extend-for-discovery-categories',
  initialize() {
    DiscoveryCategoriesController.reopen({
      tvUrl: null,
      tvPost: null,
      isYTVideo: false,

      groupedTopics: groupBy('model', 'category.name'),

      //Overrides discourse `cp`
      latestTopicOnly: null,

      actions: {
        playInTV(options) {
          this.setProperties({
            tvUrl: get(options, 'url'),
            tvPost: get(options, 'post'),
            isYTVideo: get(options, 'isYTVideo')
          });
        }
      }
    });


    DiscoveryCategoriesRoute.reopen({
      renderTemplate() {
        this.render('navigation/categories', { outlet: 'navigation-bar' });
        this.render('discovery/categories', { outlet: 'list-container' });
      },

      beforeModel() {
        this.controllerFor('navigation/categories').set('filterMode', 'categories');
      },

      model() {
        // TODO: Remove this and ensure server side does not supply `topic_list`
        // if default page is categories
        PreloadStore.remove("topic_list");

        const DASHBOARD_TAG = 'dashboard';

        return Discourse.TopicList.list(`tags/${DASHBOARD_TAG}`).then((json) => {
          return json.topics;
        });
      },

      titleToken() {
        return 'Tamil TV';
      },

      setupController(controller, model) {
        controller.set('model', model);
      }
    })
  }
};
