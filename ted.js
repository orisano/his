// ==UserScript==
// @name         New Userscript
// @version      0.1
// @match https://www.ted.com/*
// @match http://www.ted.com/*
// @description  try to take over the world!
// @author       You
// @grant        none
// @require https://localhost:8080/socket.io/socket.io.js
// ==/UserScript==

(function() {
    'use strict';
    var socket = io.connect("https://localhost:8080/");
    socket.on("play", function(){
        $("#player-hero-play").click();
    });
    socket.on("pause", function(){
        $(".controls__pause").click();
    });
    var prev = "";
    setInterval(function() {
        var $current = $(".talk-transcript__fragment--current");
        if ($current === []) return;
        var current = $current.text();
        if (prev !== current) {
            console.log("updated");
            socket.emit("current", {text: current});
            prev = current;
        }
    }, 500);
})();
