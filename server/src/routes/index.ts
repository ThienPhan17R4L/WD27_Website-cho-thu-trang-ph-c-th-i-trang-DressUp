import { Express } from 'express';
import { authRouter } from "./auth.routes";
import { productRouter } from './product.routes';
import { categoryRouter } from './category.route';

function registerRoutes(app: Express) {
    app.use('/auth', authRouter);
    app.use('/products', productRouter);
    app.use('/categories', categoryRouter);
}

export default registerRoutes;