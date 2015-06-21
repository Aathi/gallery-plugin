# name: gallery
# about: Display the topics as gallery
# version: 0.1
# authors: jstechiee & Athithan

register_asset "stylesheets/gallery.scss"

after_initialize do

  module ::DiscourseGallery

    class Engine < ::Rails::Engine
      engine_name "discourse_gallery"
      isolate_namespace DiscourseGallery
    end

  end

  require_dependency "application_controller"
  class DiscourseGallery::ContactusController < ::ApplicationController
    def index
    end
  end


  DiscourseGallery::Engine.routes.draw do
    get '/' => 'contactus#index'
  end

  Discourse::Application.routes.append do
    mount ::DiscourseGallery::Engine, at: "/contactus"
  end
end
