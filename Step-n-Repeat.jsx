/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Atomic Lotus, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * @author  Scott Lewis <scott@atomiclotus.net>
 * @url     https://atomiclotus.net
 * @date    2022-04-29
 *
 *  Installation:
 *
 *      1. Copy this file to Illustrator > Presets > Scripting
 *      2. Restart Adobe Illustrator
 *      3. Go to File > Scripts > Step-n-Repeat
 *      4. Follow the prompts
 *
 *  Usage:
 *
 *      This script will copy and repeat the selected object in rows & columns
 *      to fit the available width & height. The distance between objects is determined 
 *      by the offset of the first object from the top left corner of the artboard.
 */

#target Illustrator

var LANG = {
    /**
     * Dialog window label
     */
    LABEL_DIALOG_WINDOW: "Step-n-Repeat Settings",

    /**
     * Confirm delete preset
     */
    CONFIRM_DELETE_PRESET: 'Are you sure you want to delete the preset file?',

    /**
     * Choose file string
     */
    CHOOSE_FILE: "Choose a file",

    /**
     * No selection error string.
     */
    NO_SELECTION: "No selection",

    /**
     * Page width field label.
     */
    LABEL_PG_WIDTH: "Page Width:",

    /**
     * Page height field label.
     */
    LABEL_PG_HEIGHT: "Page Height:",

    /**
     * Column count field label.
     */
    LABEL_COL_COUNT: "Column Count:",

    /**
     * Row count field label.
     */
    LABEL_ROW_COUNT: "Row Count:",

    /**
     * Scale field label.
     */
    LABEL_SCALE: "Scale:",

    /**
     * File name field label.
     */
    LABEL_FILE_NAME: "File Name:",

    /**
     * Logging field label.
     */
    LABEL_LOGGING: "Logging?",

    /**
     * Cancel button text.
     */
    BUTTON_CANCEL: "Cancel",

    /**
     * OK button text.
     */
    BUTTON_OK: "Ok",

    /**
     * Save button text
     */
    BUTTON_SAVE: "Save Preset",

    /**
     * Delete button text
     */
    BUTTON_DELETE: "Delete",

    /**
     * Object does not exist error string.
     */
    DOES_NOT_EXIST: " does not exist",

    /**
     * Could not create document error string.
     */
    DOC_NOT_CREATED: "The document could not be created. ",

    /**
     * Could not create layer error string.
     */
    LAYER_NOT_CREATED: "Could not create layer. ",

    /**
     * Source folder field label.
     */
    LABEL_SRC_FOLDER: "Source Folder",

    /**
     * Choose folder label.
     */
    LABEL_CHOOSE_FOLDER: "Choose Folder",

    /**
     * Input field label.
     */
    LABEL_INPUT: "Save File Location",

    /**
     * Size field label.
     */
    LABEL_SIZE: "Size",

    /**
     * Output field label.
     */
    LABEL_OUTPUT: "Output",

    /**
     * Presets label
     */
    LABEL_PRESETS: "Presets"
};

var CONFIG = {

    /**
     * Number of rows
     */

    ROWS: 10,

    /**
     * Number of columns
     */

    COLS: 10,

    /**
     * Top & bottom page margins
     */

    VOFF: 64,

    /**
     * Left & Right page margins
     */

    HOFF: 64,

    /**
     * Row height. This is set programmatically.
     */

    ROW_WIDTH: 64,

    /**
     * Column Height. This is set programmatically.
     */

    COL_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_HEIGHT: 64,

    /**
     * Artboard width
     *
     * 10 columns 128 px wide, with 64 px page margins
     */

    PG_WIDTH: 1120,

    /**
     * Artboard height
     *
     * 20 rows 128 px tall, with 64 px page margins
     */

    PG_HEIGHT: 1400,

    /**
     * Page Count
     */

    PG_COUNT: 1,

    /**
     * Not yet fully-implemented. Will support multiple units
     */

    PG_UNITS: "px",

    /**
     * @deprecated
     */

    GUTTER: 0,

    /**
     * Enter scale in percentage 1-100
     */

    SCALE: 100,

    /**
     * Illustrator version compatibility
     */

    AIFORMAT: Compatibility.ILLUSTRATOR10,

    /**
     * If the icon is larger than the cell size, shrink it to the cell size
     */

    SHRINK_TO_FIT: true,

    /**
     * Starting folder for folder selector dialog
     */

    START_FOLDER: Folder.myDocuments,

    /**
     * The contact sheet file name
     */

    FILENAME: "step-n-repeat",

    /**
     * Enable logging?
     */

    LOGGING: true,

    /**
     * Verbose logging output?
     */
    DEBUG: true,

    /**
     * @deprecated
     */

    SKIP_COLS: 0,

    /**
     * Not fully-implemented
     */

    STRIP: ["svg", "ai", "eps", "txt", "pdf"],

    /**
     * Presets folder path
     */
    PRESETS_FOLDER: Folder.myDocuments + '/ai-step-n-repeat/presets',

    /**
     * Log folder path
     */

    LOG_FOLDER: Folder.myDocuments + '/ai-step-n-repeat/logs/',

    /**
     * Log file location
     */

    LOG_FILE_PATH: Folder.myDocuments + '/ai-step-n-repeat/logs/' + Utils.doDateFormat(new Date()) + '-log.txt',

    /**
     * Default path separator
     */

    PATH_SEPATATOR: "/"
};

/**
 * @author  Scott Lewis <scott@atomiclotus.net>
 * @url     https://atomiclotus.net
 * @date    2020-01-05
 */

var Utils = {};

/**
 * Add global progress bar.
 */
Utils.progress = {};

/**
 * Get a value from an object or array.
 * @param subject
 * @param key
 * @param _default
 * @returns {*}
 */
Utils.get = function(subject, key, _default) {
    var value = _default;
    if (typeof subject[key] !== 'undefined') {
        value = subject[key];
    }
    return value;
};

/**
 * Gets the screen dimensions and bounds.
 * @returns {{left: *, top: *, right: *, bottom: *}}
 * ,,-605,263,1893,-1048
 */
Utils.getScreenSize = function() {

    try {
        if (view = app.activeDocument.views[0]) {
            var zoom = view.zoom;
            view.zoom = 1;
            var screenSize = {
                left   : parseInt(view.bounds[0]),
                top    : parseInt(view.bounds[1]),
                right  : parseInt(view.bounds[2]),
                bottom : parseInt(view.bounds[3]),
                width  : parseInt(view.bounds[2]) - parseInt(view.bounds[0]),
                height : parseInt(view.bounds[1]) - parseInt(view.bounds[3])
            };
            view.zoom = zoom;
            return screenSize;
        }
    }
    catch(e) {/* Exit Gracefully */}
    return null;
};

/**
 * Saves the file in AI format.
 * @param {document} doc        The document object to save
 * @param {string}   path       The file destination path
 * @param {int}      aiformat   The Adobe Illustrator format (version)
 * @return void
 */
Utils.saveFileAsAi = function(doc, path, aiformat) {
    if (app.documents.length > 0) {
        var theDoc  = new File(path);
        var options = new IllustratorSaveOptions();
        options.compatibility = aiformat;
        options.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
        options.pdfCompatible = true;
        doc.saveAs(theDoc, options);
    }
};

/**
 *
 * @param str
 * @returns {XML|string|void}
 */
Utils.trim = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Logging for this script.
 * @param <string> The logging text
 * @return void
 */
Utils.logger = function(txt) {

    if (CONFIG.LOGGING == 0) return;
    Utils.folder(CONFIG.LOG_FOLDER);
    Utils.write_file(CONFIG.LOG_FILE_PATH, "[" + new Date().toUTCString() + "] " + txt);
};

/**
 * Logging for this script.
 * @param {string}  path        The file path
 * @param {string}  txt         The text to write
 * @param {bool}    replace     Replace the file
 * @return void
 */
Utils.write_file = function(path, txt, replace) {
    try {
        var file = new File(path);
        if (replace && file.exists) {
            file.remove();
            file = new File(path);
        }
        file.open("e", "TEXT", "????");
        file.seek(0,2);
        $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
        file.writeln(txt);
        file.close();
        return true;
    }
    catch(ex) {
        try {
            file.close();
        }
        catch(ex) {/* Exit Gracefully*/}
        throw ex;
    }
};

/**
 * Logging for this script.
 * @param {string}  path        The file path
 * @param {string}  txt         The text to write
 * @param {bool}    replace     Replace the file
 * @return void
 */
Utils.write_and_call = function(path, txt, callback) {
    try {
        var file = new File(path);
        if (file.exists) {
            file.remove();
            file = new File(path);
        }
        file.open("e", "TEXT", "????");
        file.seek(0,2);
        $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
        file.writeln(txt);
        file.close();
        callback.call(file);
    }
    catch(ex) {
        try {
            file.close();
        }
        catch(ex) {/* Exit Gracefully*/}
        throw ex;
    }
};

/**
 *
 * @param path
 * @param json
 * @param replace
 */
Utils.write_json_file = function(path, json, replace) {
    try {
        Utils.write_file(path, Utils.objectToString(json), replace);
    }
    catch(ex) {
        Utils.logger('savePresetsFile - ' + ex);
    }
};

/**
 * Reads the contents of a file.
 * @param filepath
 * @returns {string}
 */
Utils.read_file = function(filepath) {

    var content = "";

    var theFile = new File(filepath);

    if (theFile) {

        try {
            if (theFile.alias) {
                while (theFile.alias) {
                    theFile = theFile.resolve().openDlg(
                        LANG.CHOOSE_FILE,
                        txt_filter,
                        false
                   );
                }
            }
        }
        catch(ex) {
            dialog.presetsMsgBox.text = ex.message;
        }

        try {
            theFile.open('r', undefined, undefined);
            if (theFile !== '') {
                content = theFile.read();
                theFile.close();
            }
        }
        catch(ex) {

            try { theFile.close(); }catch(ex){};
            logger("read_file - " + ex);
        }
    }

    return content;
};

/**
 *
 * @param filepath
 * @returns {*}
 */
Utils.read_json_file = function(filepath) {
    var contents, result;
    try {
        if (contents = Utils.read_file(filepath)) {
            result = eval("(" + contents + ")");
            if (typeof result !== 'object') {
                result = null;
            }
        }
    }
    catch(ex) {
        logger('doUpdatePresets - ' + ex.message);
    }
    return result;
};

/**
 *
 * @param filepath
 * @param mustconfirm
 */
Utils.deleteFile = function(filepath, mustconfirm) {
    try {
        if (mustconfirm && ! confirm(LANG.CONFIRM_DELETE_PRESET)) {
            return;
        }
        new File(filepath).remove();
    }
    catch(ex) {
        Utils.logger('Utils.deleteFile - ' + ex.message);
    }
};

/**
 * Initialize a folder.
 */
Utils.folder = function(path) {
    var theFolder = new Folder(path);
    if (! theFolder.exists) {
        theFolder.create();
    }
    return theFolder;
};

/**
 * Cleans up the filename/artboardname.
 * @param   {String}    name    The name to filter and reformat.
 * @returns  {String}            The cleaned up name.
 */
Utils.filterName = function(name) {
    return decodeURIComponent(name).replace(' ', '-');
};

/**
 * Sorts a file list.
 * @param theList
 * @returns {*}
 */
Utils.sortFileList = function(theList) {
    /**
     * Callback for sorting the file list.
     * @param   {File}  a
     * @param   {File}  b
     * @returns {number}
     */
    theList.sort(function (a, b) {
        var nameA = Utils.filterName(a.name.toUpperCase());
        var nameB = Utils.filterName(b.name.toUpperCase());
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });
    return theList;
};

/**
 * Get all files in sub-folders.
 * @param srcFolder
 * @returns {Array}
 */
Utils.getFilesInSubfolders = function(srcFolder) {

    var allFiles, theFolders, svgFileList;

    if (! srcFolder instanceof Folder) return;

    allFiles    = srcFolder.getFiles();
    theFolders  = [];
    svgFileList = [];

    for (var x=0; x < allFiles.length; x++) {
        if (allFiles[x] instanceof Folder) {
            theFolders.push(allFiles[x]);
        }
    }

    if (theFolders.length == 0) {
        svgFileList = srcFolder.getFiles(/\.svg$/i);
    }
    else {
        for (var x=0; x < theFolders.length; x++) {
            fileList = theFolders[x].getFiles(/\.svg$/i);
            for (var n = 0; n<fileList.length; n++) {
                svgFileList.push(fileList[n]);
            }
        }
    }

    return svgFileList;
};

/**
 * Format the date in YYYY-MM-DD format
 * @param string date  The date in timestring format
 * @return date string in YYYY-MM-DD format (2015-10-06)
 */
Utils.doDateFormat = function(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

/**
 * Stringify an object.
 * @param obj
 * @returns {string}
 */
Utils.objectToString = function(obj) {
    var items = [];
    for (key in obj) {
        var value = obj[key];
        if (typeof(value) == "array") {
            for (var i=0; i<value.length; i++) {
                value[i] = '"' + value[i] + '"';
            }
            value = '[' + value.join(',') + ']';
        }
        else if (typeof(value) == 'object') {
            value = Utils.objectToString(value);
        }
        items.push('"' + key + '": "' + value + '"');
    }
    return "{" + items.join(',') + "}";
};

/**
 * Align objects to nearest pixel.
 * @param sel
 */
Utils.alignToNearestPixel = function(sel) {

    try {
        if (typeof sel !== "object") {
            Utils.logger(LANG.NO_SELECTION);
        }
        else {
            for (var i = 0 ; i < sel.length; i++) {
                sel[i].left = Math.round(sel[i].left);
                sel[i].top = Math.round(sel[i].top);
            }
            redraw();
        }
    }
    catch(ex) {
        Utils.logger(ex);
    }
};

/**
 * Test if all parents are visible & unlocked.
 * @param {object} item
 * @returns {boolean}
 */
Utils.isVisibleAndUnlocked = function(item) {
    return ! Utils.anyParentLocked(item) && ! Utils.anyParentHidden(item);
};

/**
 * Derived from P. J. Onori's Iconic SVG Exporter.jsx
 * @param {object} item
 * @returns {boolean}
 */
Utils.anyParentLocked = function(item) {
    while (item.parent) {
        if (item.parent.locked) {
            return true;
        }
        item = item.parent;
    }
    return false;
}

/**
 * Derived from P. J. Onori's Iconic SVG Exporter.jsx
 * @param {object} item
 * @returns {boolean}
 */
Utils.anyParentHidden = function(item) {
    while (item.parent) {
        if (item.parent.hidden) {
            return true;
        }
        item = item.parent;
    }
    return false;
};

/**
 * Groups selected items.
 * @param {Object} selection
 * @returns void
 */
//TODO: Does not currently work.
Utils.groupSelection = function(selection){
    if (selection.length > 0) {
        for (var i = 0; i < selection.length; i++) {
            selection[i].moveToEnd(newGroup);
        }
    }
};

/**
 * Display a new progress bar.
 * @param maxvalue
 * @returns {*}
 */
Utils.showProgressBar = function(maxvalue) {

    var top, right, bottom, left, bounds;

    if (bounds = Utils.getScreenSize()) {
        left = Math.abs(Math.ceil((bounds.width/2) - (450/2)));
        top = Math.abs(Math.ceil((bounds.height/2) - (100/2)));
    }

    var progress             = new Window("palette", 'Progress', [left, top, left + 450, top + 120]);
    progress.pnl              = progress.add("panel", [10, 10, 440, 100], 'Progress');
    progress.pnl.progBar      = progress.pnl.add("progressbar", [20, 45, 410, 60], 0, maxvalue);
    progress.pnl.progBarLabel = progress.pnl.add("statictext", [20, 20, 320, 35], "0 of " + maxvalue);

    progress.show();

    Utils.progress = progress;
};

/**
 * Hides and destroys the progress bar.
 */
Utils.hideProgressBar = function() {
    Utils.progress.hide();
    Utils.progress = null;
}

/**
 * Updates the progress bar.
 * @param progress
 * @returns {*}
 */
Utils.updateProgress = function(message) {
    Utils.progress.pnl.progBar.value++;
    var val = Utils.progress.pnl.progBar.value;
    var max = Utils.progress.pnl.progBar.maxvalue;
    Utils.progress.pnl.progBarLabel.text = val + ' of ' + max + ' ' + message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Updates the progress bar.
 * @param message
 * @returns void(0)
 */
Utils.updateProgressMessage = function(message) {
    var val = Utils.progress.pnl.progBar.value;
    var max = Utils.progress.pnl.progBar.maxvalue;
    Utils.progress.pnl.progBarLabel.text = val + ' of ' + max + ' ' + message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Updates the progress bar.
 * @param message
 * @returns void(0)
 */
Utils.progressBarText = function(message) {
    Utils.progress.pnl.progBarLabel.text = message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Display a new progress bar.
 * @param maxvalue
 * @returns {*}
 */
function showProgressBar(maxvalue) {

    var top, right, bottom, left, bounds;

    if (bounds = Utils.getScreenSize()) {
        left = Math.abs(Math.ceil((bounds.width/2) - (450/2)));
        top = Math.abs(Math.ceil((bounds.height/2) - (100/2)));
    }

    var progress = new Window("palette", 'Progress', [left, top, left + 450, top + 100]);
    progress.pnl = progress.add("panel", [10, 10, 440, 100], 'Progress');
    progress.pnl.progBar = progress.pnl.add("progressbar", [20, 35, 410, 60], 0, maxvalue);
    progress.pnl.progBarLabel = progress.pnl.add("statictext", [20, 20, 320, 35], "0 of " + maxvalue);

    progress.show();

    return progress;
}

/**
 * Updates the progress bar.
 * @param progress
 * @returns {*}
 */
function updateProgress(progress, message) {
    progress.pnl.progBar.value++;
    var val = progress.pnl.progBar.value;
    var max = progress.pnl.progBar.maxvalue;
    progress.pnl.progBarLabel.text = val + ' of ' + max;
    $.sleep(10);
    progress.update();
    return progress;
}

// #include "inc/utils.jsx";

var _can_run = true;

if (! app.activeDocument.selection.length) {    
    alert("Please select an object to repeat");
    _can_run = false;
}

/**
 * Saves presets to JSON file.
 * @param {object} presets  Presets object
 */
function savePresetsFile(presets) {
    var filename = presets.PG_WIDTH + "x" + presets.PG_HEIGHT + "@" + presets.SCALE + ".json";
    Utils.write_json_file(
        CONFIG.PRESETS_FOLDER + "/" + filename, {
            "PG_WIDTH"  : presets.PG_WIDTH,
            "PG_HEIGHT" : presets.PG_HEIGHT,
            "COLS"      : presets.COLS,
            "ROWS"      : presets.ROWS,
            "SCALE"     : presets.SCALE
        }, true
    );
}

/**
 * Initialize the presets select list
 * @param dialog
 */
function initPresetsList(dialog) {

    var presets, presetsFolder;

    try {
        presetsFolder = Utils.folder( CONFIG.PRESETS_FOLDER );

        if (presets = presetsFolder.getFiles("*.json")) {

            if (dialog.presets) {
                dialog.presets.removeAll();
            }

            for (var i=0; i<presets.length; i++) {
                item = dialog.presets.add("item", new File(presets[i]).name);
            }

            dialog.presets.onChange = function() {
                if ( dialog.presets.selection ) {
                    initSettingsForm(dialog, CONFIG.PRESETS_FOLDER + "/" + dialog.presets.selection.text);
                }
            }

            dialog.presets.onDoubleClick = function() {
                if ( filename = dialog.presets.selection.text ) {
                    Utils.deleteFile(CONFIG.PRESETS_FOLDER + "/" + filename, true);
                    initPresetsList(dialog);
                }
            }
        }
    }
    catch(ex) {
        Utils.logger('initPresetsList - ' + ex.message);
    }
}

/**
 * Opens a session
 *
 */
function initSettingsForm( dialog, filepath ) {

    var presets;
    if (presets = Utils.read_json_file(filepath)) {
        dialog.pageWidth.text  = Utils.get(presets, 'PG_WIDTH',  '');
        dialog.pageHeight.text = Utils.get(presets, 'PG_HEIGHT', '');
        dialog.cols.text       = Utils.get(presets, 'COLS',      '');
        dialog.rows.text       = Utils.get(presets, 'ROWS',      '');
        dialog.scale.text      = Utils.get(presets, 'SCALE',     '');
        dialog.updateConfig();
    }

    dialog.setOutputFilename();
}

function padNumber(theNumber, width) {
    return ( value + 100000 ).toString().slice(-width);
}

/**
 * Copies the current selection to the specified artboard and position.
 * @param artboardIndex
 * @param position
 */
function copyPasteSelection(artboardIndex, position) {

    var doc = app.activeDocument;

    // Copy the current selection.

    app.executeMenuCommand('copy');
    doc.selection = null;

    // Activate the target artboard.

    doc.artboards.setActiveArtboardIndex(artboardIndex);
    doc.artboards[doc.artboards.getActiveArtboardIndex()].rulerOrigin = [0, 0];

    // Paste the copied object.

    app.executeMenuCommand('pasteFront');

    // Set the copied object's position.

    var theCopiedItem = doc.selection[0];

    theCopiedItem.position = position;

    // Return a reference to the new object.

    return theCopiedItem;
}

/**
 * Deselect everything.
 */
function deselectAll() {
    try {
        app.executeMenuCommand("deselect");
    } catch(e) {}
}

/**
 * Main logic to create the Step-n-Repeat.
 * @return void
 */
function main() {

    try {
        var doc, srcFolder, saveCompositeFile;

        saveCompositeFile = false;

        // if (Utils.trim(CONFIG.OUTPUT_FILENAME) == "") {
        //     CONFIG.OUTPUT_FILENAME = srcFolder.name.replace(" ", "-") + "-step-n-repeat.ai";
        // }

        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
        doc = app.activeDocument;
        doc.artboards.setActiveArtboardIndex(
            doc.artboards.getActiveArtboardIndex()
        );

        var selectedObject = doc.selection[0];

        var rowHeight = selectedObject.height + (Math.abs(startTop));
        var colWidth = selectedObject.width + (Math.abs(startLeft));
        var currentArtboardIndex = doc.artboards.getActiveArtboardIndex()

        var board  = doc.artboards[currentArtboardIndex];
        var bounds = board.artboardRect;
        var boardWidth = Math.abs(Math.round(bounds[2] - bounds[0]));
        var boardHeight = Math.abs(Math.round(bounds[3] - bounds[1]));

        var liveWidth = boardWidth - (Math.abs(startLeft) * 2);
        var liveHeight = boardHeight - (Math.abs(startTop) * 2);

        var colCount = Math.floor(liveWidth / selectedObject.width);
        var rowCount = Math.floor(liveHeight / rowHeight);

        var itemCount =  (rowCount * colCount) - 1;

        Utils.showProgressBar(itemCount);
    }
    catch(e) { 
        var msg = 'Error initializing vars. ' + e;
        Utils.logger(msg)
        alert(msg) 
    }

    try {
        for (var i = 0; i < itemCount; i++) {

            var myY1;
            var x1 = y1 = x2 = y2 = 0;

            /*
             * loop through rows
             */
            for (var rowCounter = 1 ; rowCounter <= rowCount; rowCounter++) {

                myY1 = (startTop * -1) + (rowHeight * (rowCounter-1));

                /*
                 * loop through columns
                 */
                colCount = rowCounter > 1 && itemCount - i < colCount ? itemCount - i : colCount;

                for (var columnCounter = rowCounter == 1 ? 2 : 1 ; columnCounter <= colCount; columnCounter++) {

                    selectedObject = copyPasteSelection(currentArtboardIndex, [0, 0]);

                    Utils.updateProgress("copies made");

                    var myX1 = startLeft + (selectedObject.width * (columnCounter-1));

                    x1 = myX1;
                    y1 = myY1 * -1;

                    try {
                        selectedObject.translate(x1, y1);
                        redraw();

                        /*
                         * Only save the composite file if at least one
                         * icon exists and is successfully imported.
                         */
                        saveCompositeFile = true;
                    }
                    catch(e) { Utils.logger(e); }
                    i++;
                }
            }
        }
    }
    catch(e) {
        Utils.hideProgressBar();
        var msg = 'Error in main loop. ' + e;
        Utils.logger(msg)
        alert(msg);
    }

    if (saveCompositeFile) {
        Utils.progressBarText("Saving Step-n-Repeat");
        // Utils.saveFileAsAi(doc, new Folder(srcFolder).path + "/" + CONFIG.OUTPUT_FILENAME, CONFIG.AIFORMAT);
    }

    Utils.hideProgressBar();
}

if ( _can_run ) {

    var originalInteractionLevel = userInteractionLevel;
    userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

    main();

    userInteractionLevel = originalInteractionLevel;
}