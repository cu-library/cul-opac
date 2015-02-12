/**
 * JQuery-powered customizations of keyword search results, browse lists, and 
 * bib/eresource record display pages.
 */
$(document).ready(function() {
  /**
   * Add classes to keyword search result and browse lists.
   * Replaces iii-provided bib_display.js.
   */
  // Highlight alternate entries in keyword search results.
  // Replaces stripeTables()
  $('td.briefcitCell').filter(':odd').addClass('odd');

  // Highlight alternate entries in brief and explanded browse tables.
  // Unusual sibling selection made necessary by awkward HTML used in expanded display.
  // Replaces stripeBrowse() and stripeBrowseTables()
  $('tr.browseEntry').filter(':odd').addClass('odd');
  $('tr.browseEntry.odd').each(function() {
    var rowspan = $('td:first', this).attr('rowspan');
    if (rowspan) {
        $('~ tr.browseSubEntry', this).slice(0,(rowspan-1)).addClass('odd');
    }
  });
  
  /**
   * Bib & eresource record display customizations.
   */
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
  // "Export to RefWorks" link directs users to Carleton's Refworks login page.
  // Update link to export current record to Refworks.
  $('a#export-refworks').attr('href', function(i, attrValue) {
    return "javascript:open_refworks_window('" + $('a#recordnum').attr('href').replace(/^.+?(b\d+)$/, "$1") + "')";
  });
});

/**
 * Condensed version of IUG community export-to-RefWorks function.
 * @param {string} bibnum Bibliographic record ID
 */
function open_refworks_window(bibnum) {
  // Build Refworks import URL:
  var url = 'http://proxy.library.carleton.ca/login?url=' +
          'http://refworks.scholarsportal.info/express/expressimport.asp?vendor=Carleton%20University&filter=Refworks%20Tagged%20Format&url=' +
          'http://refworks.library.carleton.ca/cgi-bin/refworks/refworks.php?bibnum=' + bibnum;

  new_refworks_win=window.open(url,"RefWorksMain",'toolbar=1,location=1,directories=0,status=1,menubar=1,scrollbars=1,resizable=1,width=800,height=500');
  new_refworks_win.focus();
}
