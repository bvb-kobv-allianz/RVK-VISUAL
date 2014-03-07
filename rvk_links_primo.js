// RVK Link visualization for the jsonp api provided by UB Regensburg
// PRIMO version
// (c) 2012 Zuse Institute Berlin

// setup event listener in a way to not disturb other scripts (hopefully)
if (window.addEventListener) {
    // DOM2 standard
    window.addEventListener("load", rvk_stringifyRVKLinks, false);
}
else if (window.attachEvent) {
    // Microsoft's precursor to it, IE8 and earlier
    window.attachEvent("onload", rvk_stringifyRVKLinks);
}
else {
    // Some pre-1999 browser
    rvk_addLoadEvent(rvk_stringifyRVKLinks);
}

function rvk_addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

//window.onload=stringifyRVKLinks;

function rvk_stringifyRVKLinks() {
   var arr = new Array();
   arr = document.getElementsByTagName( "a" );
       
   for(var i=0; i < arr.length; i++)
   {
         var tagObj = arr[i];
        //if (tagObj.className==="rvklink") {
         if ( tagObj.className.match(/rvklink/g) ) {
        //if ( reg.test(tagObj.className) ) {
                var rvkTag=tagObj.innerHTML;
                rvkTag=rvkTag.replace(/\ /,"+");
                tagObj.setAttribute("name",tagObj.innerHTML);
                rvk_getRVKData(rvkTag);
         }
   }
}

function rvk_getRVKData(rvk) {
    var url = "http://rvk.uni-regensburg.de/api/json/ancestors/"+rvk+"?jsonp=rvk_parseRequest";
    var script = document.createElement('script');
    script.setAttribute('src', url);
    script.setAttribute("type","text/javascript"); 
    document.getElementsByTagName('head')[0].appendChild(script);        
}
 
function rvk_parseRequest(response) {
    try { 
        //var path = "";
        var rvkObj=response;
        if(rvkObj && rvkObj.node){
            //path = rvk_path(rvkObj.node);
            //var notation=rvk_notation(rvkObj.node);
            var arr=[ ];
            arr=rvk_pathAsArray(rvkObj.node,"benennung");
            var notation=rvk_pathAsArray(rvkObj.node,"notation");
            rvk_visualize(arr,notation);
            //document.getElementsByName(notation)[0].innerHTML=path;
        }

    }
    catch(an_exception) { 
        console.log(an_exception);
    }
}

function rvk_visualize(rvk_array,notation) {
    var rvkString="";
    var listEnd="";
    var rvkId=notation[0].replace(/\ /,"-");
    var rvklink=document.getElementsByName(notation[0])[0];
    //rvkString=rvkString+"<div class='rvk_accordion' id='rvk_accordion'><a href='#"+rvkId+"'>";
    rvkString=rvkString+notation[0]+": ";
    //rvkString=rvkString+rvk_array[0];
    rvklink.innerHTML=rvkString;
    rvkString="<div class='rvk_accordion' id='rvk_accordion'><a href='#"+rvkId+"'>";
    rvkString=rvkString+rvk_array[0]+" +<div id='"+rvkId+"'>";
    for (var i=1;i<rvk_array.length; i++) {
        rvkString=rvkString+"<ul><li>"+notation[i]+": "+rvk_array[i]+"</li>";
        listEnd=listEnd+"</ul>";
    }
    rvkString=rvkString+listEnd+"</div></a></div>";
    //var rvklink=document.getElementsByName(notation[0])[0];
    rvklink.insertAdjacentHTML( 'afterend', rvkString );
    // could do some more styling here
}

function rvk_path(node) {
    var arr=new Array();    
    if (node && node.benennung && node.ancestor) {
        return rvk_path(node.ancestor.node)+";"+node.benennung;
    }
    else {
        if (node && node.benennung)  {
            return node.benennung;
        } 
    }
    return "";
}       

function rvk_pathAsArray(node,key) {
    var arr= [ ];
    var rvk=node;
    while (rvk) {
        if (rvk[key]) {
            arr.push(rvk[key]);
        }
        if (!rvk.ancestor) {
                rvk=undefined;
        } else { rvk=rvk.ancestor.node; }
    }
    return arr;
}       

function rvk_notation(node) {
    if (node && node.notation) {
        return node.notation;
    }
    return "";
}       
