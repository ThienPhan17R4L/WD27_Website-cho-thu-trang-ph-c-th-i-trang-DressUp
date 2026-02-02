import { Express } from 'express';
import { authRouter } from "./auth.routes";

function registerRoutes(app: Express) {
    app.use('/auth', authRouter)
}

export default registerRoutes;