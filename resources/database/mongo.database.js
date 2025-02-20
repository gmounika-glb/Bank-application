import config from 'config';
import {MongoConnects} from './mongo.connect.js';
import logger from '../logs/logger.log.js';
class MongoConnect {
  async initialize() {
    const mongoConnect = new MongoConnects();
    mongoConnect.mongoConfiguration = config.get('mongo');
    try {
      mongoConnect.initialize();
      logger.info('Mongo Database has been connected.');
      console.log('Mongo Database has been connected.');
    } catch (error) {
      logger.error(`Mongo issues : ${error}`);
    }
  }
}
export default MongoConnect;
