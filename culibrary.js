/**
 * JQuery-powered customizations of keyword search results, browse lists, and
 * bib/eresource record display pages.
 */
$(document).ready(function() {
  /**
   * Remove forced indent in index browse tables and fix punctuation spacing.
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

  // Remove default port & all scopes from persistent record link
  $("a#recordnum").attr('href', function(i, attrValue) {
    return attrValue.replace(/~S\d+$/,'');
  });
  $("a#recordnum").text($("a#recordnum").text().replace(/\:80\//, '/').replace(/~S\d+$/,''));

  // Add title & call number as query parameters to 'Report Missing Item' form
  $("a#form-missing-item").attr('href', function(i, attrValue) {
    var params = {
        title: $('div.bibDisplayContentMain > table.bibDetail td').filter(function() { return $(this).text() === "Title"; }).next().text().trim(),
        call_number: $('table.bibItems tr:nth-child(2) td:nth-child(2)').text().trim()
    };
    return attrValue + '?' + jQuery.param(params);
  });
});
