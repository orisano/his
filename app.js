"use strict";

const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const sub = io.of("/subscribe");

const Status = Object.freeze({
    CLOSE: 0,
    OPEN: 1,
    RUNNING: 2
});

let status = Status.CLOSE;
let logs = [""];
let current = "";

const PORT = 8080;
server.listen(PORT, () => console.log(`Listen localhost:${PORT}`));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/latest", (req, res) => {
    res.send(logs[logs.length - 1]);
});

app.get("/join", (req, res) => {
    res.send(logs.join(" "));
});

app.get("/clear", (req, res) => {
    logs = [""];
    res.send("OK");
});

function detection_locale(text) {
    const c = text.charCodeAt(0);
    if (c < 255) return "en-US";
    if (c > 10000) return "ja-JP";
    return "th-TH";
}

app.get("/speak", (req, res) => {
    const text = req.query.text;
    const lang = req.query.lang || detection_locale(text);

    io.emit("speak", {text, lang});
    res.send("OK");
});

app.get("/play", (req, res) => {
    io.emit("play", {});
    res.send("OK");
});

app.get("/pause", (req, res) => {
    io.emit("pause", {});
    res.send("OK");
});

app.get("/current", (req, res) => {
    res.send(current);
});

io.on("connection", (socket) => {
    status = Status.OPEN;

    console.log("[INFO] connection established.");
    console.log("[INFO] recognize task start.");

    socket.on("result", (data) => {
        status = Status.OPEN;
        console.log(data);
        logs.push(data);
        sub.emit("data", data);
    });
    socket.on("disconnect", () => {
        status = Status.CLOSE;
        console.log("[INFO] disconnected.");
    });
    socket.on("current", (data) => {
        current = data.text;
    })
});

sub.on("connection", (socket) => {
    console.log("[INFO] subscriber registered.");
    socket.on("disconnect", () => {
        console.log("[INFO] subscriber disconnected.");
    });
});
