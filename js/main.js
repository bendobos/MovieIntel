$(window).load(function(){
  // Initialise required API keys
  var rottenTomatoesApiKey = "cr4mfrnd7ytkz2fjrjecvbk6";
  var tmdbApiKey           = "3f80307cc68162935e73a836ead90cdd";

  // Hide reset button
  $('#resetButton').hide();

  // Autocomplete, grab titles and covers from Rotten Tomatoes
  $("#searchQuery").autocomplete({
      selectFirst: true,
      select: function(event, ui) {
        $("#searchQuery").submit(doSearch());
      },
      source: function( request, response ) {
          $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies.json", {
              data: {
                  apikey: rottenTomatoesApiKey,
                  q: request.term
              },
              dataType: "jsonp",
      success: function(data) {
          response($.map(data.movies, function(movie) {
              return {
                  label: movie.title,
                  value: movie.title,
                  thumb: movie.posters.thumbnail,
                  year: movie.year
              }
          }));
      },
      minLength: 3,
      delay: 0,
          });
      }
  }).data( "autocomplete" )._renderItem = function( ul, item ) {
      var img = $("<img>").attr({ "src": item.thumb, "height": "91px", "width": "61px"});
      var link = $("<a>").text(item.label + " (" + item.year + ")").prepend(img);
      return $("<li>")
          .data( "item.autocomplete", item )
          .append(link)
          .appendTo(ul);
  };


  // Conduct the search
  var doSearch = function() {
    // Make sure only one request is sent (for example when pressing return twice)
    enterOnce = true;

    // Reset the intro styles
    $('body').css({
        'font-family': 'Roboto',
        'font-weight': '100',
        'background': '#ecf0f1'
    });
    $('#intro').hide();

    // Show reset button
    $('#resetButton').show();

    // Grab the search query
    var movieName = $('#searchQuery').val();

    $('#searchQuery').autocomplete("disable");

      // Aggregate all the information from the different services
      // The Movie DB
      getTmdbId(movieName);
      // Rotten Tomatoes
      // Actually drawing on the screen is handeled by the get functions themselves (passing values on to show functions)
  };

  var showQuote = function(quote, author) {
    $('#intro').append(
      '<div id="quoteArea">' +
        '<span class="quote">"' + quote + '"</span><br />' +
        'from the movie  "' + author + '"' +
      '</div>'
    );
  };

  // Draw the general information about the movie on the screen (first tile)
  // General information consists of:
  // Title, original title (if != title), movie backdrop, movie poster, release date
  var showGeneral = function(title, originalTitle, posterPath, backdropPath, releaseDate, tagline) {
    $('#fullWidth').append(
      '<div id="fullWidthPanel">' +
            '<img src="https://image.tmdb.org/t/p/w396' + posterPath + '" alt="' + title + ' Poster" height="278" widht="185" style=" -webkit-box-shadow: 0 8px 6px -6px black; -moz-box-shadow: 0 8px 6px -6px black; box-shadow: 0 8px 6px -6px black;"/>' + 
            '<h1>' + title + '</h1>' +
            (originalTitle != title ? '<h3><small>' + originalTitle + '</small></h3>': '') +
            (tagline != '' ? '<h4 class="tagline">"' + tagline + '"</h4>': '') +
            '<h4><small>Released on ' + releaseDate + '</h4></small>' +
      '</div>' 
    );
    $('#fullWidthPanel').css({
      background: "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.9)), url(http://image.tmdb.org/t/p/w1280" + backdropPath + ")",
      "background-size": "cover",
      "background-position": "center center",
      "background-repeat": "no-repeat",
      "background-attachment": "fixed"
    });
    $("#topbar").css(
      "background", "rgba(255, 255, 255, 0.5)"
    );
    $("#searchQuery").css(
      "color", "#000"
    );
  };

  var showTrailer = function(trailerId) {
    $('#middleCol').append(
      '<div class="panel panel-primary" id="trailerPanel">' +
        '<div class="panel-heading">Trailer</div>' +
          '<div class="panel-body">' +
           '<iframe id="ytplayer" type="text/html" src="http://www.youtube.com/embed/' + trailerId + '" frameborder="0"/>' +
          '</div>' +
      '</div>'
    );
    $("#trailerPanel").fitVids();
  };

  var showDescription = function(overview) {
    $('#leftCol').append(
      '<div class="panel panel-primary" id="descriptionPanel">' +
        '<div class="panel-heading">Description</div>' +
          '<div class="panel-body">' +
            '<p class="shadow">' + overview + '</p>' +
          '</div>' +
      '</div>'
    );
  };

  var showCast = function(cast) {
  // Save markup for cast in variable for easier usage:
    var castMarkup = '';
    for(i = 0; i <= 8; i++) {
      castMarkup += 
        '<li>' +
        '<div class="li-img">' +
          '<img src="https://image.tmdb.org/t/p/w396/' + cast[i].profile_path + '" class="castPhoto" alt="' + cast[i].name + '"/>' +
        '</div>' +
        '<div class="li-text">' +
          '<h3 class="shadow">' + cast[i].name + '</h3>' +
          '<h4>as "' + cast[i].character + '"</h4>' +
        '</div>' +
        '</li>'
      }
    $('#leftCol').append(
      '<div class="panel panel-primary" id="castPanel">' +
        '<div class="panel-heading">Cast</div>' +
        '<div class="panel-body">' +
          '<div class="cast">' +
            '<ul>' + castMarkup + '</ul></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  };

  var showReviewsRt = function(consensus, audience_rating, audience_score, critics_rating, critics_score) {
    $('#rightCol').append(
      '<div class="panel panel-primary" id="rottentomatoesPanel">' +
        '<div class="panel-heading">Rotten Tomatoes</div>' +
          '<div class="panel-body">' +
            (consensus != '' && consensus != undefined ? '<p class="tagline">"' + consensus + '"</p>' : '') +
            '<h3><small>Rated</small></h3>' +
            '<span class="rating">' + critics_score + ', "' + critics_rating + '"</span>' +
            '<h3><small>by critics</small></h3>' +
            '<hr>' +
            '<h3><small>Rated</small></h3>' +
            '<p><span class="rating">'+ audience_score +', "' + audience_rating +'"</span></p>' +
            '<h3><small>by the audience</small></h3>' +
          '</div>' +
      '</div>'
    )
  };

  var showMpaa = function(mpaa_rating) {
  if(mpaa_rating != '' && mpaa_rating != 'Unrated') {
    $('#middleCol').append(
      '<div class="panel panel-primary" id="mpaaPanel">' +
        '<div class="panel-heading">MPAA Rating</div>' +
          '<div class="panel-body">' +
             (mpaa_rating == 'G' ? '<img src="img/rated-g.png" alt="Rated G for General Audiences." /><hr>Appropriate for all ages. No offensive material.': '') +
             (mpaa_rating == 'PG' ? '<img src="img/rated-pg.png" alt="Rated PG. Parental Guidance Suggested." /><hr>Parental guidance is suggested. May contain brief nudity, horror and violence. Does not exceed moderate levels.': '') +
             (mpaa_rating == 'PG-13' ? '<img src="img/rated-pg-13.png" alt="Rated PG-13. Parents Strongly Cautioned." /><hr>Parental guidance is strongly suggested. May contain brief nudity, horror, violence and strong language.': '') +
             (mpaa_rating == 'R' ? '<img src="img/rated-r.png" alt="Rated R. Restricted." /><hr>The film may contain drug use, violence, strong language, nudity or sex.': '') +
             (mpaa_rating == 'NC-17' ? '<img src="img/rated-nc-17.png" alt="Rated NC-17. No one 17 and under admitted." /><hr>The film may contain explicit sex scenes, an accumulation of sexually-oriented language, or scenes of excessive violence.': '') +
          '</div>' +
      '</div>'
    )
  }
  };

  var showMetacritic = function(score, userscore, url) {
    $('#rightCol').append(
      '<div class="panel panel-primary" id="metacriticPanel">' +
        '<div class="panel-heading">Metacritic</div>' +
          '<div class="panel-body">' +
            '<h3>Metascore</h3>' + 
            (score == undefined ? '<div class="metascore">n/a</div>' : '<div class="metascore">' + score + '</div>') +
            '<hr>' +
            '<h3>Userscore</h3>' +
            (score == undefined ? '<div class="userscore">n/a</div>' : '<div class="userscore">' + userscore + '</div>') +
            (score != undefined ? '<br />Read more on <a href="' + url + '">metacritic.com' + '</a>' : '') +
          '</div>'
    )
  }

  var showOther = function(tags, status, budget, revenue, runtime, homepage) {
    $('#middleCol').append(
      '<div class="panel panel-primary" id="otherPanel">' +
        '<div class="panel-heading">Other Information</div>' +
          '<div class="panel-body">' +
            '<p>' + tags.join("<br />") + '</p>' +
            '<hr>' +
            '<p>Budget: ' + addCommas(budget) + ' $<br />Revenue: ' + addCommas(revenue) + ' $</p>' +
            '<hr>' +
            '<p>Runtime: ' + runtime + ' minutes<br /><a href="' + homepage + '">' + homepage + '</a>' +
          '</div>' +
      '</div>'
    )
  };


  // Get the movie ID from The Movie DB API
  // Passes it on to getTmdb, which gets all remaining information in only one request.
  var getTmdbId = function(searchQuery, response) {
    $.ajax("https://api.themoviedb.org/3/search/movie", {
      data: {
        api_key: tmdbApiKey,
        query: searchQuery
      },
      success: function(data) {
        var tmdb_id = data.results[0].id; 
        getRottentomatoes(searchQuery);
        getMetacritic(searchQuery);
        getTmdb(tmdb_id);
      },
      error: function(jqXHR) {
        var apiName = 'TMDB'
        showError(jqXHR, apiName);
      }
    });
  };

  var getTmdb = function(id, response) {
    $.ajax("http://api.themoviedb.org/3/movie/" + id, {
      data: {
        api_key: tmdbApiKey,
        append_to_response: "credits,videos,images"
      },
      success: function(data) {
        // For the first tile, get general information
        var tmdb_title          = data.title;
        var tmdb_originalTitle  = data.original_title;
        var tmdb_posterPath     = data.images.posters[0].file_path;
        var tmdb_backdropPath   = data.images.backdrops[0].file_path;
        var tmdb_releaseDate    = data.release_date;
        var tmdb_tagline        = data.tagline;
        // Draw the general information tile
        showGeneral(tmdb_title, tmdb_originalTitle, tmdb_posterPath, tmdb_backdropPath, tmdb_releaseDate, tmdb_tagline);

        // For the second tile, get the trailer link
        var tmdb_trailer        = data.videos.results[0].key;
        showTrailer(tmdb_trailer); 

        // Third tile: description, runtime and so on
        var tmdb_overview       = data.overview;
        var tmdb_cast           = new Array();
        // Get the first 9 members of the cast and put them in an array
        for (var i = 0; i <= 8; i++) {
          tmdb_cast[i] = data.credits.cast[i];
        };

        // Get other information
        var tmdb_tags           = new Array();
        for (var i = 0; i < data.genres.length; i++) {
          tmdb_tags[i] = data.genres[i].name;
        };
        var tmdb_status         = data.status;
        var tmdb_budget         = data.budget;
        var tmdb_revenue        = data.revenue;
        var tmdb_runtime        = data.runtime;
        var tmdb_homepage       = data.homepage;

        showDescription(tmdb_overview);
        showCast(tmdb_cast);
        showOther(tmdb_tags, tmdb_status, tmdb_budget, tmdb_revenue, tmdb_runtime, tmdb_homepage);
      },
      error: function(jqXHR) {
        var apiName = 'TMDB';
        showError(jqXHR, apiName);
      }
    })
  };

  // Get the reviews (user & critics) from
  // Rotten Tomatoes
  var getRottentomatoes = function(searchQuery, response) {
    $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies.json", {
      data: {
        apikey: rottenTomatoesApiKey,
        q: searchQuery
      }, 
      dataType: "jsonp",
      success: function(data) {
        var rt_critics_consensus = data.movies[0].critics_consensus;
        var rt_audience_rating   = data.movies[0].ratings.audience_rating;
        var rt_audience_score    = data.movies[0].ratings.audience_score;
        var rt_critics_rating    = data.movies[0].ratings.critics_rating;
        var rt_critics_score     = data.movies[0].ratings.critics_score;
        showReviewsRt(rt_critics_consensus, rt_audience_rating, rt_audience_score, rt_critics_rating, rt_critics_score);

        var rt_mpaa_rating       = data.movies[0].mpaa_rating;
        showMpaa(rt_mpaa_rating);
      }
    });
  };

  var getMetacritic = function(searchQuery, response) {
    $.ajax("https://byroredux-metacritic.p.mashape.com/find/movie", {
      data: {
        title: searchQuery
      },
      type: "POST",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Mashape-Authorization", "mdqSAmIY5TFQ4ZrEYfAhIzHV6NvZoNj1");
      },
      success: function(data) {
        var mc_score     = data.result.score;
        var mc_userscore = data.result.userscore;
        var mc_url       = data.result.url;
        showMetacritic(mc_score, mc_userscore, mc_url);
      },
      error: function(jqXHR) {
        var apiName = 'MetaCritic'; 
        showError(jqXHR, apiName);
      }
    });
  };

  var getQuote = function(response) {
    $.ajax("https://andruxnet-random-famous-quotes.p.mashape.com/cat=movies", {
    type: "POST",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("X-Mashape-Authorization", "mdqSAmIY5TFQ4ZrEYfAhIzHV6NvZoNj1");
    },
    success: function(data) {
      var quoteJson = $.parseJSON(data);
      if(quoteJson.category == "Movies") {
        var quote = quoteJson.quote;
        var author = quoteJson.author;
        showQuote(quote, author);
      } else {
        getQuote();
      }
    }
    });
  }

  // Functionality for "search" button
  var enterOnce = false;
  $('#searchQuery').on("keypress", function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13 &! enterOnce) {
      e.preventDefault();
      e.stopPropagation();
      $(this).autocomplete("close");
      $(this).closest('form').submit(doSearch());
    }
  });

  var showError = function(jqXHR, apiName) {
    $('body').append(
      '<div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true" id="errorModal">' +
         '<div class="modal-dialog modal-lg">' +
           '<div class="modal-content">' +
              '<span class="glyphicon glyphicon-remove-circle" id="errorIcon"></span>' +
              '<h1>Oh no!</h1>' +
              '<p>An error occured while we were fetching the data you requested! We are so sorry!</p>' +
              '<p>We suggest you try again.</p>' +
              "<p>If it still won't work, please contact us so we can resolve the issue:<br/><a href='mailto:#''>support@movieintel.com</a></p>" +
              '<p>Here is some information you should pass on to our nerds:</p>' +
              '<p id="errorCodes">' + apiName + '<br />Status: ' + jqXHR.status + ', ' + jqXHR.statusText + '</p>' +
          '<div class="modal-footer">' +
           ' <button type="button" class="btn btn-default" id="modalCloseButton" data-dismiss="modal">Got it! I will try again!</button>' +
         '</div>' +
         '</div>' +
        '</div>' +
      '</div>' 
    );
    $('#errorModal').modal();
  };

  function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

  // Get random movie quote
  getQuote();

});
