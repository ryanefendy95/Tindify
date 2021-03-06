angular.module('tindify.services', [])
    .factory('User', function() {

        var o = {
            favorites: [],
            newFavorites: 0
        };

        o.addSongToFavorites = function(song) {
            // make sure there's a song to add
            if (!song) return false;

            // add to favorites array
            o.favorites.unshift(song);
            o.newFavorites++;
        };

        o.removeSongFromFavorites = function(song, index) {
            // make sure there's a song to add
            if (!song) return false;

            // add to favorites array
            o.favorites.splice(index, 1);
        };

        o.favoriteCount = function() {
            return o.newFavorites;
        };

        return o;
    })

    .factory('Recommendations', function($http, $q, SERVER) {

        var media; // use for HTMLAudioElement

        var o = {
            queue: []
        };

        o.getNextSongs = function() {
            return $http({
                method: 'GET',
                url: SERVER.url + '/recommendations'
            }).success(function(data){
                // merge data into the queue
                o.queue = o.queue.concat(data);
            });
        };

        o.nextSong = function() {
            // pop the index 0 off
            o.queue.shift();

            // end the song
            o.haltAudio(); // halt the current audio clip

            // low on the queue? let's fill it up
            if (o.queue.length <= 3) {
                o.getNextSongs();
            }
        };

        o.playCurrentSong = function() {
            var defer = $q.defer();

            // play the current song's preview
            media = new Audio(o.queue[0].preview_url);

            // when song loaded, resolve the promise to let controller know.
            media.addEventListener("loadeddata", function() {
                defer.resolve();
            });

            media.play();

            return defer.promise;
        };

        // used when switching to favorites tab
        o.haltAudio = function() {
            if (media) media.pause();
        };

        // service that will either get the next songs or play the current song:
        o.init = function() {
            if (o.queue.length === 0) {
                // if there's nothing in the queue, fill it.
                // this also means that this is the first call of init.
                return o.getNextSongs();

            } else {
                // otherwise, play the current song
                return o.playCurrentSong();
            }
        };

        return o;
    });

