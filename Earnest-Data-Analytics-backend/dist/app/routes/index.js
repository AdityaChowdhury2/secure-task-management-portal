"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const health_route_1 = require("../modules/health/health.route");
const tasks_route_1 = require("../modules/tasks/tasks.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/",
        route: health_route_1.HealthRoutes,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/tasks",
        route: tasks_route_1.TaskRoutes,
    },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
