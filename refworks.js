// refworks.js
// Javascript for use with RefWorks Export Feature

// from http://dl.lib.brown.edu/josiah_to_refworks/josiah_to_refworks.js

var bibno;


function open_refworks_win(url){
        url=url.replace('recordnum','bibnum='+bibno);
        new_refworks_win=window.open(url,"RefWorksMain",'toolbar=1,location=1,directories=0,status=1,menubar=1,scrollbars=1,resizable=1,width=800,height=500');
        new_refworks_win.focus();
}


function get_recordnum(){
   var aTags = document.getElementsByTagName("a");
   var aTagsLen = aTags.length;
   for (var i=0; i < aTags.length; i++) {
       if (aTags[i].id == "recordnum")  {
           bibno = aTags[i];
           bibno = bibno.toString();
           var start = bibno.lastIndexOf('b');
           bibno = bibno.substr(start,8);

           newImg.src = '/screens/buttons/refworks2.gif';
           for (var m=0; m < document.images.length; m++) {
               if (
                   (document.images[m].src == "http://134.117.10.42/screens/images/blank.gif") ||
                   (document.images[m].src == "http://catalogue.library.carleton.ca/screens/images/blank.gif") ||
                   (document.images[m].src == "/screens/images/blank.gif")
                  ) {
                     document.images[m].src=newImg.src;
                     document.images[m].alt="Export to RefWorks";
                } // end if
           } // end for
       }
   }
   //document.forms.refworks.bibnum.value=bibno;
}

// end javascript code
