/* global $, MediaElementPlayer */
import Ember from 'ember';

export default Ember.View.extend({
  CONSIDERED_LISTENED_PERCENT: 95,
  hasModel: false,
  templateName: 'player',
  classNames: ["the-player"],
  classNameBindings: ['hasModel'],

  contentDidChange: function() {
    Ember.run(() => { this.__updateAudio(); });
  }.observes('controller.model'),

  // TODO: fix display flex, this code keep player on screen view
  fixHeigthSize: function () {
    Ember.run.scheduleOnce('afterRender', function (){
      var playerHeight = window.innerHeight - document.querySelector("nav").clientHeight;
      $('.the-player').height(playerHeight);
      $(document).on('scroll', () => {
        $('.the-player').css("top", window.pageYOffset);
      });
    });
  }.on('didInsertElement'),

  __removePlayer: function (controller) {
    var audioElement = $("audio.audio-element").get(0);
    audioElement.pause(0);
    audioElement.src = "";
    audioElement.load();

    controller.get('player').setSrc("");
    controller.get('player').remove();
    $('audio.audio-element').remove();
  },

  __createAudioElement: function (episode) {
    var audioElement = $('<audio></audio>', {
      controls: true,
      id: 'audio-player-' + episode.id,
      width: '100%',
      src: episode.get('source')
    }).addClass('audio-element');

    $('#wrapper-audio-element').append(audioElement);
  },

  __createPlayer: function (controller, episode) {
    var player = new MediaElementPlayer('#audio-player-' + episode.id, {
      features: ['playpause','progress','volume', 'current', 'duration'],
      enablePluginDebug: true,
      plugins: ['flash','silverlight'],
      alwaysShowControls: true,
      audioVolume: 'vertical',
      pluginPath: 'assets/',
      success: $.proxy(this.__playerBindEvents, this)
    });

    controller.set('player', player);
  },

  __updateAudio: function () {
    var controller = this.get('controller');
    var episode    = controller.get('model');

    if(episode){
      controller.updateAudio();
      if(controller.get('player')){ this.__removePlayer(controller); }
      this.__createAudioElement(episode);
      this.__createPlayer(controller, episode);
      this.set('hasModel', true);
    }
  },

  __playerBindEvents: function (media) {
    this.set('media', media);
    media.addEventListener('timeupdate', $.proxy(this.__playerTimeUpdate, this));
    media.addEventListener('loadeddata', $.proxy(this.__loadedData, this));
    media.addEventListener('play',       $.proxy(this.__playorpause, this));
    media.addEventListener('pause',      $.proxy(this.__playorpause, this));
    media.addEventListener('ended',      $.proxy(this.__ended, this));
  },

  __playerTimeUpdate: function () {
    var media = this.get('media');
    if(media && this.__isPingTime(media)) {
      var model = this.get('controller').get('model');
      if(model){
        model.set("stopped_at", parseInt(media.currentTime, 10));
      }
    }

    if(media && this.__isConsideredListened(media)) {
      this.get('controller').playerTimeUpdate();
    }
  },

  __loadedData: function () {
    this.get('controller').playerLoadedData();
  },

  __playorpause: function () {
    this.get('controller').playerPlayOrPause();
  },

  __ended: function () {
    this.get('controller').playerEnded();
    this.set('hasModel', false);

    var episodesElements = $('li.episode').get().reverse();
    for (var i = 0; i <= episodesElements.length; i++) {
      var episodeElement = $(episodesElements[i]);
      if(!episodeElement.is(".is-listened")) {
        episodeElement.find('.button-play-wrapper button').click();
        break;
      }
    }
  },

  __isConsideredListened: function (media) {
    var played = 100 * media.currentTime / media.duration;
    return played > this.CONSIDERED_LISTENED_PERCENT;
  },

  __isPingTime: function (media) {
    return parseInt(media.currentTime, 10) % 5 === 0;
  }
});
