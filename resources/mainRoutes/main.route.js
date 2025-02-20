import managerRoutes from '../../manager/manager.routes.js';
import customerRoutes from '../../customer/customer.routes.js';
class Routes {
  constructor(app) {
    app.use('/bank-api/manager', managerRoutes);
    app.use('/bank-api/customer', customerRoutes);
  }
  configureCors(app) {
    app.use((_req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
      res.setHeader('Cache-Control', 'no-cache');
      next();
    });
  }
}
export default Routes;
