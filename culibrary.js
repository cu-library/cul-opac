/**
 * JQuery-powered customizations of keyword search results, browse lists, and
 * bib/eresource record display pages.
 */
$(document).ready(function() {
  /**
   * Remove forced indent on entries in extended display for index browse tables.
   * Fix punctuation spacing on library locations, e.g.,
   *   'Floor 5 Books:IN LIBRARY' -> 'Floor 5 Books: IN LIBRARY'
   */
  $('#main-content').find('td.browseSubEntryData').each(function(){
    $(this).html( $(this).html().replace(/&nbsp;/g, '').replace(/:/g, ': ').replace(/[,.\s]+;/g, ';'));
  });

  /**
   * Add classes to keyword search result and browse lists.
   * Replaces iii-provided bib_display.js.
   */
  // Highlight alternate entries in keyword search results.
  // Replaces stripeTables()
  $('table.browseScreen td.briefcitCell').filter(':odd').addClass('odd');

  // Highlight alternate entries in brief and explanded browse tables.
  // Unusual sibling selection made necessary by awkward HTML used in expanded display.
  // Replaces stripeBrowse() and stripeBrowseTables()
  $('table.browseScreen tr.browseEntry').filter(':odd').addClass('odd');
  $('table.browseScreen tr.browseEntry.odd').each(function() {
    var rowspan = $('td:first', this).attr('rowspan');
    if (rowspan) {
        $('~ tr.browseSubEntry', this).slice(0,(rowspan-1)).addClass('odd');
    }
  });

  /**
   * Bib & eresource record display customizations.
   */
  // Show bib media icon & book jacket
  $('#bibDisplayContent').find('.bibDetail:first tr:first').prepend('<td id="bibMediaIcon" class="bibIcon"></td>');
  $('#bibMediaIcon').append( $('#bibMedia img') );
  $('#bibDisplayContent').find('.bibDetail:first tr:first').append('<td id="bibJacketIcon" class="bibIcon"></td>');
  $('#bibJacketIcon').append( $('#bibDisplayJacket img') );

  // Remove scope from persistent record URL
  $("a#recordnum").attr('href', function(i, attrValue) {
    return attrValue.replace(/~S\d+$/,'');
  });
  // Remove scope from persistent record URL text.
  // Remove ports 80, 443 on live site pages. Leave ports 2082, 444 in
  // persistent URL text on staging server pages
  $("a#recordnum").text($("a#recordnum").text().replace(':80', '').replace(':443', '').replace(/~S\d+$/,''));

  // Add author, title, and call number to 'Report Missing Item' form URL as
  // query parameters
  $("a#form-missing-item").attr('href', function(i, attrValue) {
    return attrValue + '?' + jQuery.param(getBibJSON());
  });

  // Add author, title, and call number as query parameters to thesis PDF
  // request form, if present. Remove Innovative's repeated URL in onClick
  // attribute
  $('#bibDisplayContent div.bibDisplayUrls a').filter(
    function() {
      var formURLs = [
        "https://library.carleton.ca/forms/request-pdf-copy-thesis",
        "https://library.carleton.ca/forms/request-digital-copy-pdf-masters-research-essay"
      ];
      return ($.inArray() !== -1);
      return $(this).attr('href') === "https://library.carleton.ca/forms/request-pdf-copy-thesis";
    }).attr('href', function(i, attrValue) { return attrValue.trim() + '?' + jQuery.param(getBibJSON()); }
  ).removeAttr('onClick');

});

/**
 * Finds bibliographic fields on record display page.
 * Returns JSON object.
 */
function getBibJSON() {
    var	bibJSON = {
        author: $('div.bibDisplayContentMain > table.bibDetail td').filter(function() { return $(this).text() === "Author"; }).next().text().trim(),
        title: $('div.bibDisplayContentMain > table.bibDetail td').filter(function() { return $(this).text() === "Title"; }).next().text().trim(),
        call_number: $('table.bibItems tr:nth-child(2) td:nth-child(2)').text().trim()
    };
    return bibJSON;
}
