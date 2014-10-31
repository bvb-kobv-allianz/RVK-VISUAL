/*
 * RVK Visual for expanding RVK notations using the jsonp api provided by UB Regensburg.
 *
 * Copyright 2014 Zuse Institute Berlin
 *
 * TODO maybe a global registry of retrieved notation data that can be reused in different ways?
 */

/**
 * TODO
 * @type {RvkVisual|*|{}}
 *
 * TODO necessary? explain?
 */
var RvkVisual = RvkVisual || {};

/**
 * Value for appending toggle HTML to primary RVK notation.
 * @type {number} Used as constant
 */
RvkVisual.prototype.APPEND = 0;

/**
 * Value for wrapping toggle HTML around primary RVK notation.
 * @type {number} Used as constant
 */
RvkVisual.prototype.WRAP = 1;

/**
 * Konstruiert eine RvkVisual Instanz mit Defaultwerten für die Eigenschaften.
 * @constructor
 */
function RvkVisual(rvkClassName) {
    this.togglePosition = RvkVisual.prototype.APPEND;
    this.rvkUrl = "http://rvk.uni-regensburg.de/api/json/ancestors/";
    this.callbackFuncName = 'parseData';
    this.rvkTagName = 'div';
    this.rvkClassName = (rvkClassName !== undefined) ? rvkClassName : 'rvklink';
    this.cssClassHierarchy = 'rvk-visual-details';
    this.cssClassList = 'rvk-visual-list';
    this.cssClassToggle = 'rvk-visual-toggle';
    this.htmlListItemPrefix = '<ul><li>';
    this.htmlListItemSeparator = '';
    this.htmlListItemSuffix = '</li></ul>';
    this.htmlToggleStart = '<div class="rvk-visual-toggle">';
    this.htmlToggleEnd = '</div>';
    this.htmlToggleOn = null;
    this.htmlToggleOff = null;
    this.displayHierarchy = false;
    this.toggleEnabled = false;
    this.highlightErrorsEnabled = false;
    this.debug = false; // TODO as prototype? default false
}

/**
 * Creates instance of RvkVisual.
 */
RvkVisual.newInstance = function(rvkClassName) {
    var rvkVisual = new RvkVisual(rvkClassName);
    var instances = null;
    if (RvkVisual.instances !== undefined) {
        instances = RvkVisual.instances;
        instances.push(rvkVisual);
    }
    else {
        instances = new Array();
        instances.push(rvkVisual);
        RvkVisual.instances = instances;
    }
    rvkVisual.callbackVarName = 'RvkVisual.instances[' + (instances.length - 1) + ']';
    return  rvkVisual;
}

/**
 * Prepares HTML to load RVK data for all instances of RvkVisual.
 */
RvkVisual.prepareLinks = function() {
    var instances = RvkVisual.instances;
    for (var index in instances) {
        instances[index].prepareLinks();
    }
}

/**
 * Finds all the RVK notations on the page and adds scripts for getting the RVK data from the service.
 *
 * Using the object 'rvkTags' to hold the found tags, ignores duplicate occurrences of the same notation, so that
 * every notation is only requested once from the RVK service.
 */
RvkVisual.prototype.prepareLinks = function() {
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
RvkVisual.prototype.getTags = function() {
    var arr = document.getElementsByTagName(this.rvkTagName);

    var rvkTags = new Array();

    // find all RVK tags
    for (var i = 0; i < arr.length; i++) {
        var tagObj = arr[i];
        if (this.hasClass(tagObj, this.rvkClassName)) {
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
RvkVisual.prototype.getData = function(notation) {
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
RvkVisual.prototype.parseData = function(data) {
    if (this.debug) {
        console.log('parseData');
    }
    try {
        var rvkObj = data;
        if (rvkObj && rvkObj.node) {
            var arr = [ ];
            arr = this.getPathAsArray(rvkObj.node, "benennung");
            var notation = this.getPathAsArray(rvkObj.node, "notation");
            this.render(arr, notation);
        }
        else {
            if (this.highlightErrorsEnabled) {
                var result = rvkObj.request.match(/\/[^\/?]*\?/g);
                notation = result[0].substring(1, result[0].length - 1);
                notation = notation.replace(/\+/g, ' ');
                if (this.debug) {
                    console.log('Error finding: ' + notation);
                }
                this.renderError(notation);
            }
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

/**
 * Erzeugt das HTML für die erweiterte Anzeige einer RVK Notation.
 * @param rvk_names Benennung der RVK Notationen
 * @param notation RVK Notationen
 */
RvkVisual.prototype.render = function(rvk_names, notation) {
    if (this.debug) {
        console.log(rvk_names);
        console.log(notation);
    }

    var rvkString = "";
    var listEnd = "";
    var rvkId = notation[0].replace(/\ /, "-"); // TODO what does it do?

    if (this.displayHierarchy) {
        rvkString += "<div class='" + this.cssClassHierarchy + "'>";
    }

    var notationHtml = this.getNotationHtml(notation[0], rvk_names[0]);

    if (this.displayHierarchy && this.toggleEnabled) {
         notationHtml = this.renderToggle(notationHtml);
    }

    rvkString += notationHtml;

    if (this.displayHierarchy) {
        rvkString += "<div id='" + rvkId + "' class='" + this.cssClassList + "'>";

        for (var i = 1; i < rvk_names.length; i++) {
            rvkString += this.htmlListItemPrefix;
            rvkString += this.getNotationHtml(notation[i], rvk_names[i]);
            if (i < rvk_names.length - 1) {
                rvkString += this.htmlListItemSeparator;
            }
            listEnd += this.htmlListItemSuffix;
        }
        rvkString += listEnd + "</div>";

        rvkString += "</div>";
    }

    var rvkLinksArray = this.getTagsForNotation(notation[0]);

    for (var i = 0; i < rvkLinksArray.length; i++) {

        var rvklink = rvkLinksArray[i];

        rvklink.innerHTML = rvkString;

        // Adding toggle function
        var toggleIcon = rvklink.getElementsByClassName(this.cssClassToggle);
        if (toggleIcon[0] !== undefined) {
            toggleIcon[0].onclick = this.toggleDetails;
            toggleIcon[0].rvkVisual = this;
        }
    }
}

/**
 * Renders notations marked that could not be found.
 * TODO make error CSS class configurable
 * @param notation
 */
RvkVisual.prototype.renderError = function(notation) {
    var rvkElements = this.getTagsForNotation(notation);

    for (var i = 0; i < rvkElements.length; i++) {
        rvkElements[i].innerHTML = '<div class="' + this.cssClassHierarchy + ' error">' + notation + '</div>';
    }
}

/**
 * Rendert das HTML für das Toggle-Element, um die List der Notation ein- bzw. auszublenden.
 * @param content
 * @returns {string}
 */
RvkVisual.prototype.renderToggle = function(content) {
    switch (this.togglePosition) {
        case RvkVisual.WRAP:
            return this.htmlToggleStart + content + this.htmlToggleEnd;
        case RvkVisual.APPEND:
        default:
            return content + this.htmlToggleStart + this.htmlToggleOff + this.htmlToggleEnd;
        break;
    }
}

/**
 * Blendet die Details, die übergeordneten Notation, ein- bzw. aus.
 */
RvkVisual.prototype.toggleDetails = function() {
    var elem = this.parentNode.getElementsByClassName(this.rvkVisual.cssClassList);

    if (this.debug) {
        console.log("Toggle:");
        console.log(elem);
    }

    var listDiv = elem[0];

    if (this.rvkVisual.hasClass(listDiv, 'visible')) {
        this.rvkVisual.removeClass(listDiv, 'visible')
        if (this.rvkVisual.togglePosition == RvkVisual.prototype.APPEND && this.rvkVisual.htmlToggleOff !== null) {
            this.innerHTML = this.rvkVisual.htmlToggleOff;
        }
    }
    else {
        this.rvkVisual.addClass(listDiv, 'visible');
        if (this.rvkVisual.togglePosition == RvkVisual.prototype.APPEND && this.rvkVisual.htmlToggleOn !== null) {
            this.innerHTML = this.rvkVisual.htmlToggleOn;
        }
    }
}

/**
 * Adds a class to the className of an element.
 * @param element
 * @param className
 */
RvkVisual.prototype.addClass = function(element, className) {
    if (!this.hasClass(element, className)) {
        element.className = element.className + ' ' + className;
    }
}

/**
 * Removes a class from the className of an element.
 * @param element
 * @param className
 */
RvkVisual.prototype.removeClass = function(element, className) {
   var classes = ' ' + element.className + ' ';
   classes = classes.replace(' ' + className + ' ', '');
   element.className = classes.trim();
}

/**
 * Checks if an element has a classname.
 * @param element
 * @param className
 * @returns {boolean}
 */
RvkVisual.prototype.hasClass = function(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
}

/**
 * TODO
 */
RvkVisual.prototype.getTagsForNotation = function(notation) {
    var rvkLinksArray = document.getElementsByName(notation);

    var tags = new Array();

    for (var i = 0; i < rvkLinksArray.length; i++) {
        var tagObj = rvkLinksArray[i];
        if (this.hasClass(tagObj, this.rvkClassName)) {
            tags.push(tagObj);
        }
    }

    return tags;
}

/**
 * Gibt das HTML für die Anzeige einer RVK Notation zurück.
 *
 * @param notation String mit RVK Notation
 * @param name String mit Benennung der RVK Notation
 */
RvkVisual.prototype.getNotationHtml = function(notation, name) {
    var rvkString = "";
    var searchLink = this.getNotationLink(notation);
    if (searchLink != null) {
        rvkString += "<a href=\"" + searchLink + "\" ";
        rvkString += ">";
    }

    rvkString += notation + ": " + name;

    if (searchLink != null) {
        rvkString += "</a>";
    }
    return rvkString;
}

/**
 * Liefert für eine RVK Notation einen Link zurück.
 *
 * Diese Funktion kann überschrieben werden, um in einer konkreten Instanz, z.B. Links zur Suche nach der RVK Notation
 * zu integrieren.
 *
 * @param notation
 * @returns {string}
 */
RvkVisual.prototype.getNotationLink = function(notation) {
    return null;
}

/**
 * TODO
 * @param node
 * @param key
 * @returns {Array}
 */
RvkVisual.prototype.getPathAsArray = function(node, key) {
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










