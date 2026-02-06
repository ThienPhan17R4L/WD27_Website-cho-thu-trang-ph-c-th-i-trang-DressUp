import { Express } from 'express';
import { authRouter } from "./auth.routes";
import { productRouter } from './product.routes';
import { categoryRouter } from './category.route';
import { cartRouter } from './cart.routes';

function registerRoutes(app: Express) {
    app.use('/auth', authRouter);
    app.use('/products', productRouter);
    app.use('/categories', categoryRouter);
    app.use('/cart', cartRouter);
}

export default registerRoutes;