import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { HealthRoutes } from "../modules/health/health.route";
import { TaskRoutes } from "../modules/tasks/tasks.route";

const router = Router();
const moduleRoutes = [
  {
    path: "/",
    route: HealthRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/tasks",
    route: TaskRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
