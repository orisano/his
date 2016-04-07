"use strict";

const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

server.listen(8080);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const Status = Object.freeze({
    CLOSE: 0,
    OPEN: 1,
    RUNNING: 2
});
let status = Status.CLOSE;

io.on("connection", (socket) => {
    status = Status.OPEN;
    console.log("[INFO] connection established.");
    socket.on("result", (data) => {
       console.log(data);
        status = Status.OPEN;
    });
    socket.on("disconnect", () => {
        status = status.CLOSE;
        console.log("[INFO] disconnected.");
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
    console.log("[INFO] recognize task start.")
    io.emit("recognize", "start");
}

setInterval(record, 10000);
