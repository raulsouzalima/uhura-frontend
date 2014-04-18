App.Channel = DS.Model.extend({
  title:      DS.attr(),
  image_url:  DS.attr(),
  url:        DS.attr(),
  uri:        DS.attr(),
  description:DS.attr(),
  copyright:  DS.attr(),
  subscribed: DS.attr(),
  episodes:   function(){
    var _this = this;
    jQuery.getJSON("/api/channels/"+this.get('id')+"/episodes").then(function(data){
      _this.set('episodes', data.episodes);
      $("#loading-page").parent().remove()
    })
    return [];
  }.property("channel_id"),
  to_view:    DS.attr()
});


App.Subscription = DS.Model.extend({
  title:      DS.attr(),
  image_url:  DS.attr(),
  url:        DS.attr(),
  uri:        DS.attr(),
  to_view:    DS.attr()
});
