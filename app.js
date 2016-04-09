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
const logs = [""];

server.listen(8080);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/latest", (req, res) => {
    res.send(logs[logs.length - 1]);
});

app.get("/join", (req, res) => {
    res.send(logs.join(" "));
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
    })
});

sub.on("connection", (socket) => {
    console.log("[INFO] subscriber registered.");
    socket.on("disconnect", () => {
        console.log("[INFO] subscriber disconnected.");
    })
});

function record() {
    if (status === Status.CLOSE) {
        console.log("[ERROR] index.html does not opened.");
        return;
    }
    if (status === Status.RUNNING) {
        console.log("[ERROR] recognize task does not finished.");
        return;
    }
    status = Status.RUNNING;
}
