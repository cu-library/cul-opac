/**
 * III Javascript functions
 * 
 * Combines III Javascript for easier maintenance
 */

/**
 * Requests URL specified in value attribute of option selected in list of
 * search forms listed in select control defined in toplogo.html
 * 
 * @returns {Boolean}
 */
function iiiGotoURL() {
  window.location.assign(document.getElementById("specializedSearch").value);
  return false;
}

/**
 * Prevent main menu, OPAC menu search form submission if no search terms are
 * given.
 * 
 * @returns {Boolean}
 */
function iiiSearchValidate() {
  try {
	  if (document.getElementById('search').searcharg.value === null | document.getElementById('search').searcharg.value === "") {
      return false;
    }
	}
	catch(err) { /* do nothing */ }
  return true;
}

/**
 * Form submission handler attached to links styled as buttons. 
 * 
 * @fixme added dynamically by III if not defined?
 * @returns {undefined}
 */
function iiiDoSubmit_1() {
  // getFormHandleForm() is in common.js
  var obj = getFormHandleForm(1);
  if(iiiSearchValidate()){
    obj.submit();
  }
}