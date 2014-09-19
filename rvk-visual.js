/*
 * RVK Link visualization for the jsonp api provided by UB Regensburg
 *
 * Copyright 2014 Zuse Institute Berlin
 *
 * TODO ohne jQuery?
 * TODO maybe a global registry of retrieved notation data that can be reused in different ways?
 * TODO support span instead of div
 * TODO ungültige notationen hervorheben
 * TODO keine Unterscheidung zwischen tags für resolver 1 und 4
 *
 * Notes:
 *
 * It seems that at least in chromium identical scripts are included only once.
 *
 * TODO find out why parseData is called only twice
 *
 */

/**
 * TODO
 * @type {RvkVisual|*|{}}
 *
 * TODO necessary? explain?
 */
var RvkVisual = RvkVisual || {};

/**
 * TODO
 * @constructor
 */
function RvkResolver(rvkClassName, callbackVarName) {
    this.rvkUrl = "http://rvk.uni-regensburg.de/api/json/ancestors/";
    this.callbackVarName = (callbackVarName !== undefined) ? callbackVarName : 'rvkResolver';
    this.callbackFuncName = "parseData";

    this.rvkClassName = (rvkClassName !== undefined) ? rvkClassName : 'rvklink';
    this.displayHierarchy = false;
    this.toggleEnabled = false;
    this.debug = true; // TODO as prototype? default false
}

/**
 * Finds all the RVK notations on the page and adds scripts for getting the RVK data from the service.
 *
 * Using the object 'rvkTags' to hold the found tags, ignores duplicate occurrences of the same notation, so that
 * every notation is only requested once from the RVK service.
 */
RvkResolver.prototype.prepareLinks = function() {
    var rvkNotations = {}; // empty object

    // get all RVK tags
    var rvkTags = this.getTags();

    // extract notation from tags
    for (var i = 0; i < rvkTags.length; i++) {
        var tagObj = rvkTags[i];
        var rvkTag = tagObj.innerHTML;
        rvkTag = rvkTag.replace(/\ /, "+");
        tagObj.setAttribute("name", tagObj.innerHTML);
        rvkNotations[rvkTag] = true; // add attribute to object, if it already exists overwrite
        if (this.debug) console.log("InnerText: " + tagObj.innerHTML);
    }

    // requests data from service
    for (var notation in rvkNotations) {
        this.getData(notation);
        if (this.debug) console.log("Request RVK: " + notation);
    }
}

/**
 * Finds all RVK tags on page.
 * @returns {Array} Array of RVK elements
 */
RvkResolver.prototype.getTags = function() {
    var arr = document.getElementsByTagName("div");

    var rvkTags = new Array();

    // find all RVK tags
    for (var i = 0; i < arr.length; i++) {
        var tagObj = arr[i];
        if (tagObj.className === this.rvkClassName) {
            rvkTags.push(tagObj);
        }
    }

    return rvkTags;
}

/**
 * Retrieves RVK data from service.
 *
 * A script entry is added to the head element of the document. The source of the script is requested from the RVK
 * service. The script contains the metadata for a RVK notation wrapped in a function call for processing the data
 * in the browser.
 */
RvkResolver.prototype.getData = function(notation) {
    var url = this.rvkUrl + notation + "?jsonp=" + this.callbackVarName + "." + this.callbackFuncName;
    var script = document.createElement('script');
    script.setAttribute('src', url);
    script.setAttribute("type", "text/javascript");
    document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Retrieve information from RVK json data.
 * @param response
 * TODO disconnect data parsing from visualization, so the same data can be reused in different ways
 */
RvkResolver.prototype.parseData = function(data) {
    if (this.debug) {
        console.log('parseData');
    }
    try {
        var rvkObj = data;
        if (rvkObj && rvkObj.node) {
            var arr = [ ];
            arr = this.getPathAsArray(rvkObj.node, "benennung");
            var notation = this.getPathAsArray(rvkObj.node, "notation");
            this.visualize(arr, notation);
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

/**
 *
 * @param rvk_names Benennung der RVK Notationen
 * @param notation RVK Notationen
 *
 * TODO make HTML output configurable
 */
RvkResolver.prototype.visualize = function(rvk_names, notation) {
    if (this.debug) {
        console.log(rvk_names);
        console.log(notation);
    }

    var rvkString = "";
    var listEnd = "";
    var rvkId = notation[0].replace(/\ /, "-"); // TODO what does it do?

    if (this.displayHierarchy) {
        rvkString += "<div class='rvk_accordion'>";
    }
    rvkString += this.getNotationHtml(notation[0], rvk_names[0], "style=\"float:left;padding-right:0.5em;\"");

    if (this.displayHierarchy && this.toggleEnabled) {
        rvkString += "<span class='ui-icon ui-icon-circle-plus' style='display: inline-block;'></span>";
    }

    if (this.displayHierarchy) {
        rvkString += "<div id='" + rvkId + "' class='rvk_list'>";

        for (var i = 1; i < rvk_names.length; i++) {
            rvkString += "<ul><li>";
            rvkString += this.getNotationHtml(notation[i], rvk_names[i]);
            rvkString += "</li>";
            listEnd += "</ul>";
        }
        rvkString += listEnd + "</div>";

        rvkString += "</div>";
    }


    var rvkLinksArray = this.getTagsForNotation(notation[0]);

    for (var i = 0; i < rvkLinksArray.length; i++) {

        var rvklink = rvkLinksArray[i];

        rvklink.innerHTML = rvkString;

        // Adding toggle function to icons
        var toggleIcon = $(rvklink).find("span");
        toggleIcon.on('click', function () {
            var elem = $($(this).context.parentNode).find(".rvk_list");

            if (this.debug) {
                console.log("Toggle:");
                console.log(elem);
            }

            var visible = elem.toggle().is(":visible"); // Show/Hide RVK list

            if (this.debug) console.log(visible ? 'Visible' : 'Hidden');

            this.className = ( visible ) ? "ui-icon ui-icon-circle-minus" : "ui-icon ui-icon-circle-plus";
        });
    }
}

/**
 *
 */
RvkResolver.prototype.getTagsForNotation = function(notation) {
    var rvkLinksArray = document.getElementsByName(notation);

    var tags = new Array();

    for (var i = 0; i < rvkLinksArray.length; i++) {
        var tagObj = rvkLinksArray[i];
        if (tagObj.className === this.rvkClassName) {
            tags.push(tagObj);
        }
    }

    return tags;
}

/**
 * TODO
 */
RvkResolver.prototype.getNotationHtml = function(notation, name, style) {
    var rvkString = "";
    var searchLink = this.getNotationLink(notation);
    if (searchLink != null) {
        rvkString += "<a href=\"" + searchLink + "\" "
        if (style != null) {
            rvkString += style
        }
        rvkString += ">";
    }

    rvkString += notation + ": " + name;

    if (searchLink != null) {
        rvkString += "</a>";
    }
    return rvkString;
}

/**
 * TODO
 *
 * @param notation
 * @returns {string}
 */
RvkResolver.prototype.getNotationLink = function(notation) {
    return null;
}

/**
 * TODO
 * @param node
 * @param key
 * @returns {Array}
 */
RvkResolver.prototype.getPathAsArray = function(node, key) {
    var arr = [ ];
    var rvk = node;
    while (rvk) {
        if (rvk[key]) {
            arr.push(rvk[key]);
        }
        if (!rvk.ancestor) {
            rvk = undefined;
        } else {
            rvk = rvk.ancestor.node;
        }
    }
    return arr;
}













