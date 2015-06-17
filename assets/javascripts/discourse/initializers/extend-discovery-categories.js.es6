import DiscoveryCategoriesController from 'discourse/controllers/discovery/categories';

var get = Ember.get;

export default {
  name: 'extend-for-discovery-categories',
  initialize() {
    DiscoveryCategoriesController.reopen({
      tvUrl: null,
      tvPost: null,

      sortedCategories: function() {
        let categories = this.get('model.categories');
        let sortedCategories = [];
        let publicCategories, privateCategories;

        publicCategories = categories.reject(function(category) {
          return get(category, 'read_restricted') || (get(category, 'slug') === 'uncategorized');
        });

        privateCategories = categories.filterBy('read_restricted');

        sortedCategories.pushObjects(publicCategories);
        sortedCategories.pushObjects(privateCategories);

        return sortedCategories;
      }.property('model.categories'),

      actions: {
        playInTV(url, post) {
          this.setProperties({
            tvUrl: url,
            tvPost: post
          });
        }
      }
    });
  }
};
