"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const prisma_1 = __importDefault(require("./app/config/prisma"));
const node_http_1 = require("node:http");
let server;
server = (0, node_http_1.createServer)(app_1.default);
const removeOldListeners = () => {
    server.removeAllListeners("error");
    server.removeAllListeners("listening");
};
const tryListen = (port) => {
    // 🧹 remove old event listeners before retry
    removeOldListeners();
    // Try to listen on the specified port
    server.once("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
            setTimeout(() => {
                tryListen(port + 1);
            }, 1000);
        }
        else {
            console.error(err);
            process.exit(1);
        }
    });
    // If listening is successful, log the port
    server.once("listening", () => {
        console.log(`✅ Assignment API listening on port ${port}`);
    });
    // Start listening on the specified port
    server.listen(port);
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Start BullMQ workers in the same process
            // startAllWorkers();
            // Start Socket.IO server
            // startSocketServer(server);
            // Try to listen on the configured port, or the next available port
            tryListen(config_1.default.port);
        }
        catch (error) {
            console.error(error);
            // Important: exit the process with error code
            process.exit(1);
        }
    });
}
main();
const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Received ${signal}, shutting down...`);
    try {
        // Close BullMQ workers first
        // await shutdownAllWorkers();
        // console.log("✅ BullMQ workers disconnected");
        // Close Socket.IO server
        // shutdownSocketServer();
        // console.log("✅ Socket.IO server disconnected");
        yield prisma_1.default.$disconnect();
        console.log("✅ Prisma disconnected");
        // ✅ Wrap server.close in a Promise so we can await it
        server.close(() => {
            console.log("HTTP server closed");
            process.exit(1);
        });
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (reason, promise) => {
    console.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    gracefulShutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
    console.log(`Uncaught Exception: ${error}`);
    gracefulShutdown("uncaughtException");
});
