/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

// This test tests <select> in a child process. This is different than
// single-process as a <menulist> is used to implement the dropdown list.

requestLongerTimeout(2);

const XHTML_DTD = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';

const PAGECONTENT =
  "<html xmlns='http://www.w3.org/1999/xhtml'>" +
  "<body onload='gChangeEvents = 0;gInputEvents = 0; gClickEvents = 0; document.body.firstChild.focus()'>" +
  "<select oninput='gInputEvents++' onchange='gChangeEvents++' onclick='if (event.target == this) gClickEvents++'>" +
  "  <optgroup label='First Group'>" +
  "    <option value='One'>One</option>" +
  "    <option value='Two'>Two</option>" +
  "  </optgroup>" +
  "  <option value='Three'>Three</option>" +
  "  <optgroup label='Second Group' disabled='true'>" +
  "    <option value='Four'>Four</option>" +
  "    <option value='Five'>Five</option>" +
  "  </optgroup>" +
  "  <option value='Six' disabled='true'>Six</option>" +
  "  <optgroup label='Third Group'>" +
  "    <option value='Seven'>   Seven  </option>" +
  "    <option value='Eight'>&nbsp;&nbsp;Eight&nbsp;&nbsp;</option>" +
  "  </optgroup></select><input />Text" +
  "</body></html>";

const PAGECONTENT_SMALL =
  "<html>" +
  "<body><select id='one'>" +
  "  <option value='One'>One</option>" +
  "  <option value='Two'>Two</option>" +
  "</select><select id='two'>" +
  "  <option value='Three'>Three</option>" +
  "  <option value='Four'>Four</option>" +
  "</select><select id='three'>" +
  "  <option value='Five'>Five</option>" +
  "  <option value='Six'>Six</option>" +
  "</select></body></html>";

const PAGECONTENT_GROUPS =
  "<html>" +
  "<body><select id='one'>" +
  "  <optgroup label='Group 1'>" +
  "    <option value='G1 O1'>G1 O1</option>" +
  "    <option value='G1 O2'>G1 O2</option>" +
  "    <option value='G1 O3'>G1 O3</option>" +
  "  </optgroup>" +
  "  <optgroup label='Group 2'>" +
  "    <option value='G2 O1'>G2 O4</option>" +
  "    <option value='G2 O2'>G2 O5</option>" +
  "    <option value='Hidden' style='display: none;'>Hidden</option>" +
  "  </optgroup>" +
  "</select></body></html>";

const PAGECONTENT_SOMEHIDDEN =
  "<html><head><style>.hidden { display: none; }</style></head>" +
  "<body><select id='one'>" +
  "  <option value='One' style='display: none;'>OneHidden</option>" +
  "  <option value='Two' class='hidden'>TwoHidden</option>" +
  "  <option value='Three'>ThreeVisible</option>" +
  "  <option value='Four'style='display: table;'>FourVisible</option>" +
  "  <option value='Five'>FiveVisible</option>" +
  "  <optgroup label='GroupHidden' class='hidden'>" +
  "    <option value='Four'>Six.OneHidden</option>" +
  "    <option value='Five' style='display: block;'>Six.TwoHidden</option>" +
  "  </optgroup>" +
  "  <option value='Six' class='hidden' style='display: block;'>SevenVisible</option>" +
  "</select></body></html>";

const PAGECONTENT_TRANSLATED =
  "<html><body>" +
  "<div id='div'>" +
  "<iframe id='frame' width='320' height='295' style='border: none;'" +
  "        src='data:text/html,<select id=select autofocus><option>he he he</option><option>boo boo</option><option>baz baz</option></select>'" +
  "</iframe>" +
  "</div></body></html>";

const PAGECONTENT_COLORS =
  "<html><head><style>" +
  "  .blue { color: #fff; background-color: #00f; }" +
  "  .green { color: #800080; background-color: green; }" +
  "  .defaultColor { color: -moz-ComboboxText; }" +
  "  .defaultBackground { background-color: -moz-Combobox; }" +
  "</style>" +
  "<body><select id='one'>" +
  '  <option value="One" style="color: #fff; background-color: #f00;">{"color": "rgb(255, 255, 255)", "backgroundColor": "rgb(255, 0, 0)"}</option>' +
  '  <option value="Two" class="blue">{"color": "rgb(255, 255, 255)", "backgroundColor": "rgb(0, 0, 255)"}</option>' +
  '  <option value="Three" class="green">{"color": "rgb(128, 0, 128)", "backgroundColor": "rgb(0, 128, 0)"}</option>' +
  '  <option value="Four" class="defaultColor defaultBackground">{"color": "-moz-ComboboxText", "backgroundColor": "rgba(0, 0, 0, 0)", "unstyled": "true"}</option>' +
  '  <option value="Five" class="defaultColor">{"color": "-moz-ComboboxText", "backgroundColor": "rgba(0, 0, 0, 0)", "unstyled": "true"}</option>' +
  '  <option value="Six" class="defaultBackground">{"color": "-moz-ComboboxText", "backgroundColor": "rgba(0, 0, 0, 0)", "unstyled": "true"}</option>' +
  '  <option value="Seven" selected="true">{"unstyled": "true"}</option>' +
  "</select></body></html>";

const PAGECONTENT_COLORS_ON_SELECT =
  "<html><head><style>" +
  "  #one { background-color: #7E3A3A; color: #fff }" +
  "</style>" +
  "<body><select id='one'>" +
  '  <option value="One">{"color": "rgb(255, 255, 255)", "backgroundColor": "rgba(0, 0, 0, 0)"}</option>' +
  '  <option value="Two">{"color": "rgb(255, 255, 255)", "backgroundColor": "rgba(0, 0, 0, 0)"}</option>' +
  '  <option value="Three">{"color": "rgb(255, 255, 255)", "backgroundColor": "rgba(0, 0, 0, 0)"}</option>' +
  '  <option value="Four" selected="true">{"end": "true"}</option>' +
  "</select></body></html>";

const TRANSPARENT_SELECT =
  "<html><head><style>" +
  "  #one { background-color: transparent; }" +
  "</style>" +
  "<body><select id='one'>" +
  '  <option value="One">{"unstyled": "true"}</option>' +
  '  <option value="Two" selected="true">{"end": "true"}</option>' +
  "</select></body></html>";

const OPTION_COLOR_EQUAL_TO_UABACKGROUND_COLOR_SELECT =
  "<html><head><style>" +
  "  #one { background-color: black; color: white; }" +
  "</style>" +
  "<body><select id='one'>" +
  '  <option value="One" style="background-color: white; color: black;">{"color": "rgb(0, 0, 0)", "backgroundColor": "rgb(255, 255, 255)"}</option>' +
  '  <option value="Two" selected="true">{"end": "true"}</option>' +
  "</select></body></html>";

function openSelectPopup(selectPopup, mode = "key", selector = "select", win = window) {
  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");

  if (mode == "click" || mode == "mousedown") {
    let mousePromise;
    if (mode == "click") {
      mousePromise = BrowserTestUtils.synthesizeMouseAtCenter(selector, { }, win.gBrowser.selectedBrowser);
    } else {
      mousePromise = BrowserTestUtils.synthesizeMouse(selector, 5, 5, { type: "mousedown" }, win.gBrowser.selectedBrowser);
    }

    return Promise.all([popupShownPromise, mousePromise]);
  }

  EventUtils.synthesizeKey("KEY_ArrowDown", { altKey: true, code: "ArrowDown" }, win);
  return popupShownPromise;
}

function hideSelectPopup(selectPopup, mode = "enter", win = window) {
  let browser = win.gBrowser.selectedBrowser;
  let selectClosedPromise = ContentTask.spawn(browser, null, function*() {
    Cu.import("resource://gre/modules/SelectContentHelper.jsm");
    return ContentTaskUtils.waitForCondition(() => !SelectContentHelper.open);
  });

  if (mode == "escape") {
    EventUtils.synthesizeKey("KEY_Escape", { code: "Escape" }, win);
  } else if (mode == "enter") {
    EventUtils.synthesizeKey("KEY_Enter", { code: "Enter" }, win);
  } else if (mode == "click") {
    EventUtils.synthesizeMouseAtCenter(selectPopup.lastChild, { }, win);
  }

  return selectClosedPromise;
}

function getInputEvents() {
  return ContentTask.spawn(gBrowser.selectedBrowser, {}, function() {
    return content.wrappedJSObject.gInputEvents;
  });
}

function getChangeEvents() {
  return ContentTask.spawn(gBrowser.selectedBrowser, {}, function() {
    return content.wrappedJSObject.gChangeEvents;
  });
}

function getClickEvents() {
  return ContentTask.spawn(gBrowser.selectedBrowser, {}, function() {
    return content.wrappedJSObject.gClickEvents;
  });
}

function getSystemColor(color) {
  // Need to convert system color to RGB color.
  let textarea = document.createElementNS("http://www.w3.org/1999/xhtml", "textarea");
  textarea.style.color = color;
  return getComputedStyle(textarea).color;
}

function testOptionColors(index, item, menulist) {
  // The label contains a JSON string of the expected colors for
  // `color` and `background-color`.
  let expected = JSON.parse(item.label);

  for (let color of Object.keys(expected)) {
    if (color.toLowerCase().includes("color") &&
        !expected[color].startsWith("rgb")) {
      expected[color] = getSystemColor(expected[color]);
    }
  }

  // Press Down to move the selected item to the next item in the
  // list and check the colors of this item when it's not selected.
  EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });

  if (expected.end) {
    return;
  }

  if (expected.unstyled) {
    ok(!item.hasAttribute("customoptionstyling"),
      `Item ${index} should not have any custom option styling`);
  } else {
    is(getComputedStyle(item).color, expected.color,
       "Item " + (index) + " has correct foreground color");
    is(getComputedStyle(item).backgroundColor, expected.backgroundColor,
       "Item " + (index) + " has correct background color");
  }
}

function* doSelectTests(contentType, dtd) {
  const pageUrl = "data:" + contentType + "," + escape(dtd + "\n" + PAGECONTENT);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  yield openSelectPopup(selectPopup);

  let isWindows = navigator.platform.indexOf("Win") >= 0;

  is(menulist.selectedIndex, 1, "Initial selection");
  is(selectPopup.firstChild.localName, "menucaption", "optgroup is caption");
  is(selectPopup.firstChild.getAttribute("label"), "First Group", "optgroup label");
  is(selectPopup.childNodes[1].localName, "menuitem", "option is menuitem");
  is(selectPopup.childNodes[1].getAttribute("label"), "One", "option label");

  EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });
  is(menulist.menuBoxObject.activeChild, menulist.getItemAtIndex(2), "Select item 2");
  is(menulist.selectedIndex, isWindows ? 2 : 1, "Select item 2 selectedIndex");

  EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });
  is(menulist.menuBoxObject.activeChild, menulist.getItemAtIndex(3), "Select item 3");
  is(menulist.selectedIndex, isWindows ? 3 : 1, "Select item 3 selectedIndex");

  EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });

  // On Windows, one can navigate on disabled menuitems
  is(menulist.menuBoxObject.activeChild, menulist.getItemAtIndex(9),
     "Skip optgroup header and disabled items select item 7");
  is(menulist.selectedIndex, isWindows ? 9 : 1, "Select or skip disabled item selectedIndex");

  for (let i = 0; i < 10; i++) {
    is(menulist.getItemAtIndex(i).disabled, i >= 4 && i <= 7, "item " + i + " disabled")
  }

  EventUtils.synthesizeKey("KEY_ArrowUp", { code: "ArrowUp" });
  is(menulist.menuBoxObject.activeChild, menulist.getItemAtIndex(3), "Select item 3 again");
  is(menulist.selectedIndex, isWindows ? 3 : 1, "Select item 3 selectedIndex");

  is((yield getInputEvents()), 0, "Before closed - number of input events");
  is((yield getChangeEvents()), 0, "Before closed - number of change events");
  is((yield getClickEvents()), 0, "Before closed - number of click events");

  EventUtils.synthesizeKey("a", { accelKey: true });
  yield ContentTask.spawn(gBrowser.selectedBrowser, { isWindows }, function(args) {
    Assert.equal(String(content.getSelection()), args.isWindows ? "Text" : "",
      "Select all while popup is open");
  });

  // Backspace should not go back
  let handleKeyPress = function(event) {
    ok(false, "Should not get keypress event");
  }
  window.addEventListener("keypress", handleKeyPress);
  EventUtils.synthesizeKey("VK_BACK_SPACE", { });
  window.removeEventListener("keypress", handleKeyPress);

  yield hideSelectPopup(selectPopup);

  is(menulist.selectedIndex, 3, "Item 3 still selected");
  is((yield getInputEvents()), 1, "After closed - number of input events");
  is((yield getChangeEvents()), 1, "After closed - number of change events");
  is((yield getClickEvents()), 0, "After closed - number of click events");

  // Opening and closing the popup without changing the value should not fire a change event.
  yield openSelectPopup(selectPopup, "click");
  yield hideSelectPopup(selectPopup, "escape");
  is((yield getInputEvents()), 1, "Open and close with no change - number of input events");
  is((yield getChangeEvents()), 1, "Open and close with no change - number of change events");
  is((yield getClickEvents()), 1, "Open and close with no change - number of click events");
  EventUtils.synthesizeKey("VK_TAB", { });
  EventUtils.synthesizeKey("VK_TAB", { shiftKey: true });
  is((yield getInputEvents()), 1, "Tab away from select with no change - number of input events");
  is((yield getChangeEvents()), 1, "Tab away from select with no change - number of change events");
  is((yield getClickEvents()), 1, "Tab away from select with no change - number of click events");

  yield openSelectPopup(selectPopup, "click");
  EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });
  yield hideSelectPopup(selectPopup, "escape");
  is((yield getInputEvents()), isWindows ? 2 : 1, "Open and close with change - number of input events");
  is((yield getChangeEvents()), isWindows ? 2 : 1, "Open and close with change - number of change events");
  is((yield getClickEvents()), 2, "Open and close with change - number of click events");
  EventUtils.synthesizeKey("VK_TAB", { });
  EventUtils.synthesizeKey("VK_TAB", { shiftKey: true });
  is((yield getInputEvents()), isWindows ? 2 : 1, "Tab away from select with change - number of input events");
  is((yield getChangeEvents()), isWindows ? 2 : 1, "Tab away from select with change - number of change events");
  is((yield getClickEvents()), 2, "Tab away from select with change - number of click events");

  is(selectPopup.lastChild.previousSibling.label, "Seven", "Spaces collapsed");
  is(selectPopup.lastChild.label, "\xA0\xA0Eight\xA0\xA0", "Non-breaking spaces not collapsed");

  yield BrowserTestUtils.removeTab(tab);
}

add_task(function* setup() {
  yield SpecialPowers.pushPrefEnv({
    "set": [
      ["dom.select_popup_in_parent.enabled", true],
      ["dom.forms.select.customstyling", true]
    ]
  });
});

add_task(function*() {
  yield doSelectTests("text/html", "");
});

add_task(function*() {
  yield doSelectTests("application/xhtml+xml", XHTML_DTD);
});

// This test opens a select popup and removes the content node of a popup while
// The popup should close if its node is removed.
add_task(function*() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_SMALL);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  // First, try it when a different <select> element than the one that is open is removed
  yield openSelectPopup(selectPopup, "click", "#one");

  yield ContentTask.spawn(gBrowser.selectedBrowser, {}, function() {
    content.document.body.removeChild(content.document.getElementById("two"));
  });

  // Wait a bit just to make sure the popup won't close.
  yield new Promise(resolve => setTimeout(resolve, 1000));

  is(selectPopup.state, "open", "Different popup did not affect open popup");

  yield hideSelectPopup(selectPopup);

  // Next, try it when the same <select> element than the one that is open is removed
  yield openSelectPopup(selectPopup, "click", "#three");

  let popupHiddenPromise = BrowserTestUtils.waitForEvent(selectPopup, "popuphidden");
  yield ContentTask.spawn(gBrowser.selectedBrowser, {}, function() {
    content.document.body.removeChild(content.document.getElementById("three"));
  });
  yield popupHiddenPromise;

  ok(true, "Popup hidden when select is removed");

  // Finally, try it when the tab is closed while the select popup is open.
  yield openSelectPopup(selectPopup, "click", "#one");

  popupHiddenPromise = BrowserTestUtils.waitForEvent(selectPopup, "popuphidden");
  yield BrowserTestUtils.removeTab(tab);
  yield popupHiddenPromise;

  ok(true, "Popup hidden when tab is closed");
});

// This test opens a select popup that is isn't a frame and has some translations applied.
add_task(function*() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_TRANSLATED);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  // First, get the position of the select popup when no translations have been applied.
  yield openSelectPopup(selectPopup);

  let rect = selectPopup.getBoundingClientRect();
  let expectedX = rect.left;
  let expectedY = rect.top;

  yield hideSelectPopup(selectPopup);

  // Iterate through a set of steps which each add more translation to the select's expected position.
  let steps = [
    [ "div", "transform: translateX(7px) translateY(13px);", 7, 13 ],
    [ "frame", "border-top: 5px solid green; border-left: 10px solid red; border-right: 35px solid blue;", 10, 5 ],
    [ "frame", "border: none; padding-left: 6px; padding-right: 12px; padding-top: 2px;", -4, -3 ],
    [ "select", "margin: 9px; transform: translateY(-3px);", 9, 6 ],
  ];

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    let step = steps[stepIndex];

    yield ContentTask.spawn(gBrowser.selectedBrowser, step, function*(contentStep) {
      return new Promise(resolve => {
        let changedWin = content;

        let elem;
        if (contentStep[0] == "select") {
          changedWin = content.document.getElementById("frame").contentWindow;
          elem = changedWin.document.getElementById("select");
        } else {
          elem = content.document.getElementById(contentStep[0]);
        }

        changedWin.addEventListener("MozAfterPaint", function() {
          resolve();
        }, {once: true});

        elem.style = contentStep[1];
        elem.getBoundingClientRect();
      });
    });

    yield openSelectPopup(selectPopup);

    expectedX += step[2];
    expectedY += step[3];

    let popupRect = selectPopup.getBoundingClientRect();
    is(popupRect.left, expectedX, "step " + (stepIndex + 1) + " x");
    is(popupRect.top, expectedY, "step " + (stepIndex + 1) + " y");

    yield hideSelectPopup(selectPopup);
  }

  yield BrowserTestUtils.removeTab(tab);
});

// Test that we get the right events when a select popup is changed.
add_task(function* test_event_order() {
  const URL = "data:text/html," + escape(PAGECONTENT_SMALL);
  yield BrowserTestUtils.withNewTab({
    gBrowser,
    url: URL,
  }, function*(browser) {
    let menulist = document.getElementById("ContentSelectDropdown");
    let selectPopup = menulist.menupopup;

    // According to https://html.spec.whatwg.org/#the-select-element,
    // we want to fire input, change, and then click events on the
    // <select> (in that order) when it has changed.
    let expectedEnter = [
      {
        type: "input",
        cancelable: false,
        targetIsOption: false,
      },
      {
        type: "change",
        cancelable: false,
        targetIsOption: false,
      },
    ];

    let expectedClick = [
      {
        type: "mousedown",
        cancelable: true,
        targetIsOption: true,
      },
      {
        type: "mouseup",
        cancelable: true,
        targetIsOption: true,
      },
      {
        type: "input",
        cancelable: false,
        targetIsOption: false,
      },
      {
        type: "change",
        cancelable: false,
        targetIsOption: false,
      },
      {
        type: "click",
        cancelable: true,
        targetIsOption: true,
      },
    ];

    for (let mode of ["enter", "click"]) {
      let expected = mode == "enter" ? expectedEnter : expectedClick;
      yield openSelectPopup(selectPopup, "click", mode == "enter" ? "#one" : "#two");

      let eventsPromise = ContentTask.spawn(browser, [mode, expected], function*([contentMode, contentExpected]) {
        return new Promise((resolve) => {
          function onEvent(event) {
            select.removeEventListener(event.type, onEvent);
            Assert.ok(contentExpected.length, "Unexpected event " + event.type);
            let expectation = contentExpected.shift();
            Assert.equal(event.type, expectation.type,
                         "Expected the right event order");
            Assert.ok(event.bubbles, "All of these events should bubble");
            Assert.equal(event.cancelable, expectation.cancelable,
                         "Cancellation property should match");
            Assert.equal(event.target.localName,
                         expectation.targetIsOption ? "option" : "select",
                         "Target matches");
            if (!contentExpected.length) {
              resolve();
            }
          }

          let select = content.document.getElementById(contentMode == "enter" ? "one" : "two");
          for (let event of ["input", "change", "mousedown", "mouseup", "click"]) {
            select.addEventListener(event, onEvent);
          }
        });
      });

      EventUtils.synthesizeKey("KEY_ArrowDown", { code: "ArrowDown" });
      yield hideSelectPopup(selectPopup, mode);
      yield eventsPromise;
    }
  });
});

function* performLargePopupTests(win) {
  let browser = win.gBrowser.selectedBrowser;

  yield ContentTask.spawn(browser, null, function*() {
    let doc = content.document;
    let select = doc.getElementById("one");
    for (var i = 0; i < 180; i++) {
      select.add(new content.Option("Test" + i));
    }

    select.options[60].selected = true;
    select.focus();
  });

  let selectPopup = win.document.getElementById("ContentSelectDropdown").menupopup;
  let browserRect = browser.getBoundingClientRect();

  // Check if a drag-select works and scrolls the list.
  yield openSelectPopup(selectPopup, "mousedown", "select", win);

  let scrollPos = selectPopup.scrollBox.scrollTop;
  let popupRect = selectPopup.getBoundingClientRect();

  // First, check that scrolling does not occur when the mouse is moved over the
  // anchor button but not the popup yet.
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 5, popupRect.top - 10, { type: "mousemove" }, win);
  is(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position after mousemove over button should not change");

  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.top + 10, { type: "mousemove" }, win);

  // Dragging above the popup scrolls it up.
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.top - 20, { type: "mousemove" }, win);
  ok(selectPopup.scrollBox.scrollTop < scrollPos - 5, "scroll position at drag up");

  // Dragging below the popup scrolls it down.
  scrollPos = selectPopup.scrollBox.scrollTop;
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 20, { type: "mousemove" }, win);
  ok(selectPopup.scrollBox.scrollTop > scrollPos + 5, "scroll position at drag down");

  // Releasing the mouse button and moving the mouse does not change the scroll position.
  scrollPos = selectPopup.scrollBox.scrollTop;
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 25, { type: "mouseup" }, win);
  is(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position at mouseup should not change");

  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 20, { type: "mousemove" }, win);
  is(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position at mousemove after mouseup should not change");

  // Now check dragging with a mousedown on an item
  let menuRect = selectPopup.childNodes[51].getBoundingClientRect();
  EventUtils.synthesizeMouseAtPoint(menuRect.left + 5, menuRect.top + 5, { type: "mousedown" }, win);

  // Dragging below the popup scrolls it down.
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 20, { type: "mousemove" }, win);
  ok(selectPopup.scrollBox.scrollTop > scrollPos + 5, "scroll position at drag down from option");

  // Dragging above the popup scrolls it up.
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.top - 20, { type: "mousemove" }, win);
  ok(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position at drag up from option");

  scrollPos = selectPopup.scrollBox.scrollTop;
  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 25, { type: "mouseup" }, win);
  is(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position at mouseup from option should not change");

  EventUtils.synthesizeMouseAtPoint(popupRect.left + 20, popupRect.bottom + 20, { type: "mousemove" }, win);
  is(selectPopup.scrollBox.scrollTop, scrollPos, "scroll position at mousemove after mouseup should not change");


  yield hideSelectPopup(selectPopup, "escape", win);

  let positions = [
    "margin-top: 300px;",
    "position: fixed; bottom: 100px;",
    "width: 100%; height: 9999px;"
  ];

  let position;
  while (positions.length) {
    yield openSelectPopup(selectPopup, "key", "select", win);

    let rect = selectPopup.getBoundingClientRect();
    ok(rect.top >= browserRect.top, "Popup top position in within browser area");
    ok(rect.bottom <= browserRect.bottom, "Popup bottom position in within browser area");

    // Don't check the scroll position for the last step as the popup will be cut off.
    if (positions.length > 0) {
      let cs = win.getComputedStyle(selectPopup);
      let bpBottom = parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
      let selectedOption = 60;

      if (Services.prefs.getBoolPref("dom.forms.selectSearch")) {
        // Use option 61 instead of 60, as the 60th option element is actually the
        // 61st child, since the first child is now the search input field.
        selectedOption = 61;
      }
      // Some of the styles applied to the menuitems are percentages, meaning
      // that the final layout calculations returned by getBoundingClientRect()
      // might return floating point values. We don't care about sub-pixel
      // accuracy, and only care about the final pixel value, so we add a
      // fuzz-factor of 1.
      SimpleTest.isfuzzy(selectPopup.childNodes[selectedOption].getBoundingClientRect().bottom,
                         selectPopup.getBoundingClientRect().bottom - bpBottom,
                         1, "Popup scroll at correct position " + bpBottom);
    }

    yield hideSelectPopup(selectPopup, "enter", win);

    position = positions.shift();

    let contentPainted = BrowserTestUtils.contentPainted(browser);
    yield ContentTask.spawn(browser, position, function*(contentPosition) {
      let select = content.document.getElementById("one");
      select.setAttribute("style", contentPosition || "");
      select.getBoundingClientRect();
    });
    yield contentPainted;
  }
}

function* performSelectSearchTests(win) {
  let browser = win.gBrowser.selectedBrowser;
  yield ContentTask.spawn(browser, null, function*() {
    let doc = content.document;
    let select = doc.getElementById("one");

    for (var i = 0; i < 40; i++) {
      select.add(new content.Option("Test" + i));
    }

    select.options[1].selected = true;
    select.focus();
  });

  let selectPopup = win.document.getElementById("ContentSelectDropdown").menupopup;
  yield openSelectPopup(selectPopup, false, "select", win);

  let searchElement = selectPopup.querySelector("textbox");
  searchElement.focus();

  EventUtils.synthesizeKey("O", {}, win);
  is(selectPopup.childNodes[2].hidden, false, "First option should be visible");
  is(selectPopup.childNodes[3].hidden, false, "Second option should be visible");

  EventUtils.synthesizeKey("3", {}, win);
  is(selectPopup.childNodes[2].hidden, true, "First option should be hidden");
  is(selectPopup.childNodes[3].hidden, true, "Second option should be hidden");
  is(selectPopup.childNodes[4].hidden, false, "Third option should be visible");

  EventUtils.synthesizeKey("Z", {}, win);
  is(selectPopup.childNodes[4].hidden, true, "Third option should be hidden");
  is(selectPopup.childNodes[1].hidden, true, "First group header should be hidden");

  EventUtils.synthesizeKey("VK_BACK_SPACE", {}, win);
  is(selectPopup.childNodes[4].hidden, false, "Third option should be visible");

  EventUtils.synthesizeKey("VK_BACK_SPACE", {}, win);
  is(selectPopup.childNodes[5].hidden, false, "Second group header should be visible");

  EventUtils.synthesizeKey("VK_BACK_SPACE", {}, win);
  EventUtils.synthesizeKey("O", {}, win);
  EventUtils.synthesizeKey("5", {}, win);
  is(selectPopup.childNodes[5].hidden, false, "Second group header should be visible");
  is(selectPopup.childNodes[1].hidden, true, "First group header should be hidden");

  EventUtils.synthesizeKey("VK_BACK_SPACE", {}, win);
  is(selectPopup.childNodes[1].hidden, false, "First group header should be shown");

  EventUtils.synthesizeKey("VK_BACK_SPACE", {}, win);
  is(selectPopup.childNodes[8].hidden, true, "Option hidden by content should remain hidden");

  yield hideSelectPopup(selectPopup, "escape", win);
}

// This test checks the functionality of search in select elements with groups
// and a large number of options.
add_task(function* test_select_search() {
  yield SpecialPowers.pushPrefEnv({
    set: [
      ["dom.forms.selectSearch", true],
    ],
  });
  const pageUrl = "data:text/html," + escape(PAGECONTENT_GROUPS);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  yield performSelectSearchTests(window);

  yield BrowserTestUtils.removeTab(tab);

  yield SpecialPowers.popPrefEnv();
});

// This test checks select elements with a large number of options to ensure that
// the popup appears within the browser area.
add_task(function* test_large_popup() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_SMALL);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  yield* performLargePopupTests(window);

  yield BrowserTestUtils.removeTab(tab);
});

// This test checks the same as the previous test but in a new smaller window.
add_task(function* test_large_popup_in_small_window() {
  let newwin = yield BrowserTestUtils.openNewBrowserWindow({ width: 400, height: 400 });

  const pageUrl = "data:text/html," + escape(PAGECONTENT_SMALL);
  let browserLoadedPromise = BrowserTestUtils.browserLoaded(newwin.gBrowser.selectedBrowser);
  yield BrowserTestUtils.loadURI(newwin.gBrowser.selectedBrowser, pageUrl);
  yield browserLoadedPromise;

  newwin.gBrowser.selectedBrowser.focus();

  yield* performLargePopupTests(newwin);

  yield BrowserTestUtils.closeWindow(newwin);
});

// This test checks that a mousemove event is fired correctly at the menu and
// not at the browser, ensuring that any mouse capture has been cleared.
add_task(function* test_mousemove_correcttarget() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_SMALL);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let selectPopup = document.getElementById("ContentSelectDropdown").menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  yield new Promise(resolve => {
    window.addEventListener("mousemove", function(event) {
      is(event.target.localName.indexOf("menu"), 0, "mouse over menu");
      resolve();
    }, {capture: true, once: true});

    EventUtils.synthesizeMouseAtCenter(selectPopup.firstChild, { type: "mousemove" });
  });

  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mouseup" }, gBrowser.selectedBrowser);

  yield hideSelectPopup(selectPopup);

  // The popup should be closed when fullscreen mode is entered or exited.
  for (let steps = 0; steps < 2; steps++) {
    yield openSelectPopup(selectPopup, "click");
    let popupHiddenPromise = BrowserTestUtils.waitForEvent(selectPopup, "popuphidden");
    let sizeModeChanged = BrowserTestUtils.waitForEvent(window, "sizemodechange");
    BrowserFullScreen();
    yield sizeModeChanged;
    yield popupHiddenPromise;
  }

  yield BrowserTestUtils.removeTab(tab);
});

// This test checks when a <select> element has some options with altered display values.
add_task(function* test_somehidden() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_SOMEHIDDEN);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let selectPopup = document.getElementById("ContentSelectDropdown").menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  // The exact number is not needed; just ensure the height is larger than 4 items to accomodate any popup borders.
  ok(selectPopup.getBoundingClientRect().height >= selectPopup.lastChild.getBoundingClientRect().height * 4, "Height contains at least 4 items");
  ok(selectPopup.getBoundingClientRect().height < selectPopup.lastChild.getBoundingClientRect().height * 5, "Height doesn't contain 5 items");

  // The label contains the substring 'Visible' for items that are visible.
  // Otherwise, it is expected to be display: none.
  is(selectPopup.parentNode.itemCount, 9, "Correct number of items");
  let child = selectPopup.firstChild;
  let idx = 1;
  while (child) {
    is(getComputedStyle(child).display, child.label.indexOf("Visible") > 0 ? "-moz-box" : "none",
       "Item " + (idx++) + " is visible");
    child = child.nextSibling;
  }

  yield hideSelectPopup(selectPopup, "escape");
  yield BrowserTestUtils.removeTab(tab);
});

// This test checks when a <select> element has styles applied to <option>s within it.
add_task(function* test_colors_applied_to_popup_items() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_COLORS);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  // The label contains a JSON string of the expected colors for
  // `color` and `background-color`.
  is(selectPopup.parentNode.itemCount, 7, "Correct number of items");
  let child = selectPopup.firstChild;
  let idx = 1;

  ok(!child.selected, "The first child should not be selected");
  while (child) {
    testOptionColors(idx, child, menulist);
    idx++;
    child = child.nextSibling;
  }

  yield hideSelectPopup(selectPopup, "escape");
  yield BrowserTestUtils.removeTab(tab);
});

// This test checks when a <select> element has styles applied to itself.
add_task(function* test_colors_applied_to_popup() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_COLORS_ON_SELECT);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  is(selectPopup.parentNode.itemCount, 4, "Correct number of items");
  let child = selectPopup.firstChild;
  let idx = 1;

  is(getComputedStyle(selectPopup).color, "rgb(255, 255, 255)",
    "popup has expected foreground color");
  is(getComputedStyle(selectPopup).backgroundColor, "rgb(126, 58, 58)",
    "popup has expected background color");

  ok(!child.selected, "The first child should not be selected");
  while (child) {
    testOptionColors(idx, child, menulist);
    idx++;
    child = child.nextSibling;
  }

  yield hideSelectPopup(selectPopup, "escape");

  yield BrowserTestUtils.removeTab(tab);
});

// This test checks when a <select> element has a transparent background applied to itself.
add_task(function* test_transparent_applied_to_popup() {
  const pageUrl = "data:text/html," + escape(TRANSPARENT_SELECT);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  is(selectPopup.parentNode.itemCount, 2, "Correct number of items");
  let child = selectPopup.firstChild;
  let idx = 1;

  is(getComputedStyle(selectPopup).color, getSystemColor("-moz-ComboboxText"),
    "popup has expected foreground color");
  is(getComputedStyle(selectPopup).backgroundColor, getSystemColor("-moz-Combobox"),
    "popup has expected background color");

  ok(!child.selected, "The first child should not be selected");
  while (child) {
    testOptionColors(idx, child, menulist);
    idx++;
    child = child.nextSibling;
  }

  yield hideSelectPopup(selectPopup, "escape");

  yield BrowserTestUtils.removeTab(tab);
});

// This test checks that the popup is closed when the select element is blurred.
add_task(function* test_blur_hides_popup() {
  const pageUrl = "data:text/html," + escape(PAGECONTENT_SMALL);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  yield ContentTask.spawn(tab.linkedBrowser, null, function*() {
    content.addEventListener("blur", function(event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    content.document.getElementById("one").focus();
  });

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  yield openSelectPopup(selectPopup);

  let popupHiddenPromise = BrowserTestUtils.waitForEvent(selectPopup, "popuphidden");

  yield ContentTask.spawn(tab.linkedBrowser, null, function*() {
    content.document.getElementById("one").blur();
  });

  yield popupHiddenPromise;

  ok(true, "Blur closed popup");

  yield BrowserTestUtils.removeTab(tab);
});

// This test checks when a <select> element has a background set, and the
// options have their own background set which is equal to the default
// user-agent background color, but should be used because the select
// background color has been changed.
add_task(function* test_options_inverted_from_select_background() {
  const pageUrl = "data:text/html," + escape(OPTION_COLOR_EQUAL_TO_UABACKGROUND_COLOR_SELECT);
  let tab = yield BrowserTestUtils.openNewForegroundTab(gBrowser, pageUrl);

  let menulist = document.getElementById("ContentSelectDropdown");
  let selectPopup = menulist.menupopup;

  let popupShownPromise = BrowserTestUtils.waitForEvent(selectPopup, "popupshown");
  yield BrowserTestUtils.synthesizeMouseAtCenter("#one", { type: "mousedown" }, gBrowser.selectedBrowser);
  yield popupShownPromise;

  is(selectPopup.parentNode.itemCount, 2, "Correct number of items");
  let child = selectPopup.firstChild;
  let idx = 1;

  // The popup has a black background and white text, but the
  // options inside of it have flipped the colors.
  is(getComputedStyle(selectPopup).color, "rgb(255, 255, 255)",
    "popup has expected foreground color");
  is(getComputedStyle(selectPopup).backgroundColor, "rgb(0, 0, 0)",
    "popup has expected background color");

  ok(!child.selected, "The first child should not be selected");
  while (child) {
    testOptionColors(idx, child, menulist);
    idx++;
    child = child.nextSibling;
  }

  yield hideSelectPopup(selectPopup, "escape");

  yield BrowserTestUtils.removeTab(tab);
});
