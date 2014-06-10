/*
 *   MAJAX - The Millennium AJAX Library
 *
 *   Copyright 2007 by Godmar Back godmar@gmail.com 
 *   and Annette Bailey, Virginia Tech.
 *
 *   License: This software is released under the LGPL license,
 *   See http://www.gnu.org/licenses/lgpl.txt
 *
 *   $Id: majax.js,v 1.16 2008/02/16 17:45:47 gback Exp gback $
 *
 *   Instructions:
 *   ------------
 *   This file must be placed into the /screens directory of a III
 *   Millennium installation.   Subsequently, other webpages can 
 *   include this file to make AJAX calls to the Millennium system.
 *
 */

/* To customize, either change this section of the file, or create 
 * your own .js file and include that before or after majax.js.
 * The file you create should look like this:
 *
 * var noCopiesFound = "We don't have this item";
 *
 * with entries for all message you wish to customize.
 */

/*****************************************************************/
/* A regular expression that is matched against a status to determine if
 * an item should count as available.
 */
if (!isAvailableRegex)
    var isAvailableRegex = /AVAILABLE/;

/* 
 * Messages used by majax-showholdings 
 * showholdings always reports on the status of all copies found.
 */
if (!noCopiesFound) 
    var noCopiesFound = "No copies found."; 

/* 1 copy was found, say what it's status is. */
if (!singleCopyStatus)
    var singleCopyStatus = "1 copy is %s";

/* If multiple copies were found, say how many and what their statuses are. */
/* %n is substituted with how many. */
/* %s is substituted with a comma-separated list of statuses. */
if (!multipleCopyStatus)
    var multipleCopyStatus = "%n copies found: %s";

/*****************************************************************/
/* Messages used by majax-showholdings-brief  - showholdings brief
 * says that it's available if at least 1 copy is available.
 */
if (!itemAvailableMsg) 
    var itemAvailableMsg = "This item is available";

/* If no copy was found (this is suppressed if 856$u is present.) */
if (!noCopyHeld)
    var noCopyHeld = "No copy held";

/* If 1 copy was found, but it's not available. */
if (!singleItemUnavailable)
    var singleItemUnavailable = "This item is %s";

/* If >1 copy was found, but none is available. */
if (!multipleItemsUnavailable)
    var multipleItemsUnavailable = "No copy currently available (copies are %s)";

/* message shown in majax-ebook */
var electronicBookMsg = "[Electronic Book]";

/*****************************************************************/
/*
 * Add an event handler, browser-compatible.
 * This code taken from http://www.dustindiaz.com/rock-solid-addevent/
 * See also http://www.quirksmode.org/js/events_compinfo.html
 *          http://novemberborn.net/javascript/event-cache
 */
function addEvent( obj, type, fn ) {
        if (obj.addEventListener) {
                obj.addEventListener( type, fn, false );
                EventCache.add(obj, type, fn);
        }
        else if (obj.attachEvent) {
                obj["e"+type+fn] = fn;
                obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
                obj.attachEvent( "on"+type, obj[type+fn] );
                EventCache.add(obj, type, fn);
        }
        else {
                obj["on"+type] = obj["e"+type+fn];
        }
}

/* unload all event handlers on page unload to avoid memory leaks */
var EventCache = function(){
        var listEvents = [];
        return {
                listEvents : listEvents,
                add : function(node, sEventName, fHandler){
                        listEvents.push(arguments);
                },
                flush : function(){
                        var i, item;
                        for(i = listEvents.length - 1; i >= 0; i = i - 1){
                                item = listEvents[i];
                                if(item[0].removeEventListener){
                                        item[0].removeEventListener(item[1], item[2], item[3]);
                                };
                                if(item[1].substring(0, 2) != "on"){
                                        item[1] = "on" + item[1];
                                };
                                if(item[0].detachEvent){
                                        item[0].detachEvent(item[1], item[2]);
                                };
                                item[0][item[1]] = null;
                        };
                }
        };
}();
addEvent(window,'unload',EventCache.flush);
// end of rock-solid addEvent

String.prototype.trim = function() { 
    return this.replace(/^\s+|\s+$/g, ''); 
};

// Begin MAJAX code

function majaxProcessRemainingSpans(spanElems) {
    var requestsSentToServer = 0;
    while (spanElems.length > 0) {
        var spanElem = spanElems.pop();
        if (spanElem.expanded)
            continue;

        var cName = spanElem.className;
        if (cName == null)
            continue;

        var mReq = {
            span: spanElem, 
            removeTitle: function () {
                this.span.setAttribute('title', '');
            },
            success: new Array(),
            failure: new Array(),
            onsuccess: function (result) {
                for (var i = 0; i < this.success.length; i++)
                    try {
                        this.success[i](this, result);
                    } catch (er) { }
                this.removeTitle();
            },
            onfailure: function (status) {
                for (var i = 0; i < this.failure.length; i++)
                    try {
                        this.failure[i](this, status);
                    } catch (er) { }
                this.removeTitle();
            },
            /* get the search item that's sent to III
             * The search term may be in the title, or in the body.
             * It's in the body if the title contains a "*".
             * Example:  
             *           <span title="i0123456789"></span>
             *           <span title="i*">0123456789</span>
             */
            getSearchItem: function () {
                if (this.searchitem === undefined) {
                    var m, req = this.span.getAttribute('title');
                    if ((m = req.match(/^(o|i|t|\.b)\*$/)) != null) {
                        var text = this.span.innerText || this.span.textContent || "";
                        text = text.trim().toLowerCase();
                        // ignore surrounding content for ISBN which can occur in 020$a fields
                        // such as in 1412936373 (cloth)
                        if (m[1] == "i") {
                            var m2 = text.match(/((\d|x|X){10,13})/);
                            if (m2) {
                                text = m2[1];
                            }
                        }
                        this.searchitem = m[1] + text;

                        // remove children and make sure <span> is visible
                        while (this.span.hasChildNodes())
                            this.span.removeChild(this.span.firstChild);
                        this.span.style.display = "inline";
                    } else
                        this.searchitem = req.toLowerCase();
                }
                return this.searchitem;
            },
            printSearchItem: function () {
                var m, req = this.searchitem;
                if ((m = req.match(/^o(\S*)/)) != null)
                    return "OCLC# '" + m[1] + "'";
                else if ((m = req.match(/^i(\S*)/)) != null)
                    return "ISBN '" + m[1] + "'";
                else if ((m = req.match(/^t(\S*)/)) != null)
                    return "Title '" + m[1] + "'";
                else if ((m = req.match(/^\.(b\S*)/)) != null)
                    return "Bibrecord '" + m[1] + "'";
                return
                    return "illegal majax request: " + req;
            }
        };

        function addHandler(majaxClass, mReq) {
            // insert field datafield/subfield only
            var m = majaxClass.match(/majax-marc-(\d\d\d)-(\S)/);
            if (m == null) {
                m = majaxClass.match(/majax-marc-(\d\d\d)/);
            }
            if (m) {
                mReq.success.push(function (mReq, result) {
                    var msg = null;
                    var dfield = result.marc['f' + m[1]];
                    if (dfield == null)
                        return;

                    if (m[2]) {         // m[2] is MARC subfield
                        var d = dfield[m[2]];
                        if (d !== undefined)
                            msg = d + " ";
                    } else {
                        var _1 = "abcdefghijklmnopqrstuvwxyz0123456789";
                        msg = "";
                        for (var i = 0; i < _1.length; i++) {
                            var d = dfield[_1.charAt(i)];
                            if (d !== undefined)
                                msg += d + " ";
                        }
                    }
                    if (msg != null)
                        mReq.span.appendChild(document.createTextNode(msg));
                });
                return true;
            }

            var ms = majaxClass.match(/majax-syndetics-(\S+)/i);
            if (ms) {
                var clientid = ms[1];
                mReq.success.push(function (mReq, result) {
                    var req = mReq.getSearchItem();
                    if (req.charAt(0) == 'i') {
                        var img = document.createElement("img");
                        var isbn = req.substring(1);
                        img.setAttribute('src', 
                                "http://syndetics.com/hw7.pl?isbn=" + isbn 
                                + "/SC.GIF&client=" + clientid);
                        mReq.span.appendChild(img);
                    }
                });
                return true;
            }

            switch (majaxClass) {
            case "majax-showholdings-div":
            case "majax-shd":
                mReq.success.push(function (mReq, result) {
                    var divHTML = "";
                    for (var i = 0; i < result.holdings.length; i++) {
                        divHTML += "Copy " + (i+1) + ": " 
                                + result.holdings[i].toLowerCase() + "<br />";
                    }
                    var div = document.createElement("div");
                    div.innerHTML = divHTML;
                    mReq.span.appendChild(div);
                });
                break;

            case "majax-newline":
            case "majax-nl":
                mReq.success.push(function (mReq, result) {
                    mReq.span.appendChild(document.createElement("br"));
                });
                break;

            case "majax-space":
            case "majax-s":
                mReq.success.push(function (mReq, result) {
                    mReq.span.appendChild(document.createTextNode(" "));
                });
                break;

            case "majax-showholdings-brief":
            case "majax-shb":
                mReq.success.push(function (mReq, result) {
                    var isAvailable = false;
                    var msg = "";
                    for (var i = 0; i < result.holdings.length; i++) {
                        if (result.holdings[i].match(isAvailableRegex))
                            isAvailable = true;
                        msg += (i == 0 ? "" : " ") + result.holdings[i].toLowerCase();
                    }
                    if (isAvailable) {
                        msg = itemAvailableMsg;
                    } else {
                        switch (result.holdings.length) {
                        case 1:
                            msg = singleItemUnavailable.replace(/%s/, msg);
                            break;
                        case 0:
                            msg = noCopyHeld;
                            if (result.marc.f856 && result.marc.f856.u)
                                msg = "";
                            break;
                        default:
                            msg = multipleItemsUnavailable.replace(/%s/, msg);
                            break;
                        }
                    }
                    mReq.span.appendChild(document.createTextNode(msg));
                });
                break;

            case "majax-showholdings":
            case "majax-sh":
                mReq.success.push(function (mReq, result) {
                    var msg = "";
                    var isAvailable = false;
                    for (var i = 0; i < result.holdings.length; i++) {
                        msg += (i == 0 ? "" : ", ") + result.holdings[i].toLowerCase();
                        if (result.holdings[i].match(isAvailableRegex)) {
                            isAvailable = true;
                        }
                    }
                    switch (result.holdings.length) {
                    case 0:
                        msg = noCopiesFound;
                        if (result.marc.f856 && result.marc.f856.u)
                            msg = "";
                        break;
                    case 1:
                        msg = singleCopyStatus.replace(/%s/, msg);
                        break;
                    default:
                        msg = multipleCopyStatus.replace(/%n/, result.holdings.length).replace(/%s/, msg);
                        break;
                    }
                    mReq.span.appendChild(document.createTextNode(msg));
                    // XXX: if !isAvailable && bibnumber given, add request button
                });
                break;

            case "majax-reportfailure":
            case "majax-rf":
                mReq.failure.push(function (mReq, status) {
                    var msg = mReq.printSearchItem() + " not found";
                    mReq.span.appendChild(document.createTextNode(msg));
                });
                break;

            case "majax-endnote":
            case "majax-en":
                mReq.success.push(function (mReq, result) {
                    var p = document.createElement("PRE");
                    p.className += "majax-endnote-style";
                    p.appendChild(document.createTextNode(result.endnote));
                    mReq.span.appendChild(p);
                });
                break;

            case "majax-endnote-switch":
            case "majax-ens":
                mReq.success.push(function (mReq, result) {
                    var p = result.majaxMakeEndnoteDisplay(document, 
                            " Endnote", "Show", "Hide", "majax-endnote-style");
                    mReq.span.appendChild(p);
                });
                break;

            case "majax-harvard-reference":
            case "majax-hr":
                mReq.success.push(function (mReq, result) {
                    mReq.span.innerHTML += result.majaxMakeHarvardReference();
                });
                break;

            case "majax-endnote-import":
            case "majax-eni":
                mReq.success.push(function (mReq, result) {
                    var a = result.majaxMakeEndnoteImport(document);
                    a.appendChild(document.createTextNode("Click here to import into EndNote"));
                    mReq.span.appendChild(a);
                });
                break;

            case "majax-ebook":
            case "majax-eb":
                mReq.success.push(function (mReq, result) {
                    try {
                        // do not consider this an electronic book if there is a 856|3.
                        // TBD: implement http://roytennant.com/proto/856/analysis.html
                        if (result.marc.f856.subfields['3'] != null) {
                            return;
                        }
                        var a = document.createElement("a");
                        a.setAttribute("href", result.marc.f856.u);
                        a.appendChild(document.createTextNode(electronicBookMsg));
                        mReq.span.appendChild(a);
                    } catch (er) { }
                });
                break;

            case "majax-linktocatalog":
            case "majax-l":
                mReq.success.push(function (mReq, result) {
                    var p = mReq.span.parentNode;
                    var s = mReq.span.nextSibling;
                    p.removeChild(mReq.span);
                    var a = document.createElement("a");
                    a.setAttribute("href", majax.majaxSearchURL(mReq.getSearchItem()));
                    a.appendChild(mReq.span);
                    p.insertBefore(a, s);
                });
                break;

            default:
                return false;
            }
            return true;
        }

        var hasMajax = false;
        var classEntries = cName.split(/\s+/);
        for (var i = 0; i < classEntries.length; i++) {
            if (addHandler(classEntries[i], mReq))
                hasMajax = true;
        }

        if (!hasMajax)
            continue;

        mReq.span.expanded = true;      // optimistically

        // majaxSearch returns true if the search could not be filled from the cache
        // and thus required that a request was sent to the server.
        if (majax.majaxSearch(mReq.getSearchItem(), mReq))
            requestsSentToServer++;

        // send up to 5 requests every 50ms, that's 5 * 20 = 100 per second.
        // tune these numbers if you feel comfortable doing so.
        // note that MAJAX will only send 1 request per search term,
        // no matter how many spans contain the search term.
        if (requestsSentToServer >= 5) {
            window.setTimeout(function () {
                majaxProcessRemainingSpans(spanElems);
            }, 50);
            return;
        }
    }
}

function majaxProcessSpans() {
    var span = document.getElementsByTagName("span");
    var spanElems = new Array();
    for (var i = 0; i < span.length; i++) {
        spanElems[i] = span[span.length - 1 - i];
    }
    majaxProcessRemainingSpans(spanElems);
}

var majax;      // set in majaxOnLoad when current window finishes loading

// hidden iframe is loaded, commence majax processing
function majaxLoaded() {
    majax.debug = false;
    for (var i = 0; i < majaxLoadHandlers.length; i++) {
        majaxLoadHandlers[i]();
    }
    majax.loaded = true;
    majaxProcessSpans();
}

// current window is loaded, add hidden-iframe for cross-domain communication
function majaxOnLoad() {
    try {
        var iframe = document.createElement("iframe");
        iframe.setAttribute("id", "hiddeniframe");
        iframe.setAttribute("name", "hiddeniframe");
        // find our install location, then replace majax.js with majax.html
        var scripts = document.getElementsByTagName('script');
        for (var si = 0; si < scripts.length; si++) {
            var script = scripts[si];
            if (script.src && script.src.match(/.*\/majax.js/)) {
                var html = script.src.replace(/.js$/, ".html");
                break;
            } 
        }
        iframe.style.display = "none";
        addEvent(iframe, "load", majaxLoaded);
        document.body.appendChild(iframe);
        majax = document.frames ? document.frames['hiddeniframe'] : 
                           document.getElementById("hiddeniframe").contentWindow;

        // must delay setting src until after 'majax' is set so that majaxLoaded can be called safely.
        iframe.setAttribute("src", html);
    } catch (er) {
        alert("error in majaxOnLoad: " + er);
    }
}

// array of functions which majax runs before doing the span processing.
var majaxLoadHandlers = new Array();

/*
 * Add a function to be run before processing spans
 * Conservatively, this function works even if called after MAJAX 
 * has completed loading and has already processed the spans once.
 */
function majaxRunBeforeSpanProcessing(func) {
    if (majax !== undefined && majax.loaded) {
        func();
        majaxProcessSpans();
    } else {
        majaxLoadHandlers.push(func);
    }
}

try {
    var superdomain = document.domain.replace(/.*\.(([^.]+\.){1}[^.]+)$/, "$1");
    document.domain = superdomain;
} catch (e) {
    alert("majax: Cannot set document.domain to " + superdomain);
}

addEvent(window, "load", majaxOnLoad);

