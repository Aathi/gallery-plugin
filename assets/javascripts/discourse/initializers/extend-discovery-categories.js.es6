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
  initialize(container, application) {
    DiscoveryCategoriesController.reopen({
      tvUrl: null,
      tvPost: null,
      tvTopic: null,
      isYTVideo: false,

      groupedTopics: groupBy('model', 'category.name'),

      //Overrides discourse `cp`
      latestTopicOnly: null,

      actions: {
        playInTV(options) {
          this.setProperties({
            tvUrl: get(options, 'url'),
            tvPost: get(options, 'post'),
            tvTopic: get(options, 'topic'),
            isYTVideo: get(options, 'isYTVideo')
          });
        }
      }
    });


    DiscoveryCategoriesRoute.reopen({
      page: 0,

      renderTemplate() {
        this.render('navigation/categories', { outlet: 'navigation-bar' });
        this.render('discovery/categories', { outlet: 'list-container' });
      },

      beforeModel() {
        this.set('dashboardTopics', Ember.A());
        this.controllerFor('navigation/categories').set('filterMode', 'categories');
      },

      model() {
        // TODO: Remove this and ensure server side does not supply `topic_list`
        // if default page is categories
        PreloadStore.remove("topic_list");

        const DASHBOARD_TAG = 'dashboard';
        let url = 'tags/' + DASHBOARD_TAG;

        return this.fetchDashboardTopics(url).catch((error) => {
          console.error(error);
          throw error;
        });
      },

      titleToken() {
        return 'Tamil TV';
      },

      fetchDashboardTopics(url, params) {
        const store = Discourse.__container__.lookup('store:main');

        return store.findFiltered("topicList", { filter: url, params: params }).then((json) => {
          this.get('dashboardTopics').pushObjects(json.topics);
          if(json.topics.length === 30) {
            let newPage = this.get('page') + 1;
            let pageParam = {
              page: newPage
            };

            this.set('page', newPage);
            return this.fetchDashboardTopics(url, pageParam);
          }
          return this.get('dashboardTopics');
        });
      },

      setupController(controller, model) {
        var currentUser = Discourse.User.current();
        this.controllerFor('navigation/categories').set('canCreateCategory', (currentUser && currentUser.get('admin')));

        controller.set('model', model);
      }
    })
  }
};
