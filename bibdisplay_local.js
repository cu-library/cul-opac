/**
 * JQuery-powered customizations of bib record display page
 */
$(document).ready(function() {
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
