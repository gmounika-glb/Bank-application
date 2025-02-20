import pkg from 'mongoose';
import config from 'config';
const {connect, set, connection} = pkg;
class MongoConnects {
  constructor() {
    let mongoConfiguration = '';
    Object.defineProperty(this, 'mongoConfiguration', {
      set(mongoInfo) {
        mongoConfiguration = mongoInfo;
      },
      get() {
        return mongoConfiguration;
      },
    });
  }
  initialize() {
    return new Promise((resolve, reject) => {
      set('strictQuery', false);
      const mongoAtlasStatus = config.get('mongo_atlas_enabled');
      if (mongoAtlasStatus === true) {
        connect(config.get('mongo_atlas_url'));
        console.log('connected to mongo atlas');
      } else if (
        this.mongoConfiguration.username != '' &&
        this.mongoConfiguration.password != ''
      ) {
        connect(
          `mongodb://${this.mongoConfiguration.username}:${this.mongoConfiguration.password}@${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`
        );
      } else {
        connect(
          `mongodb://${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`
        );
      }
      const db = connection;
      db.on('error', error => {
        reject(error.message);
      });
      db.once('open', () => {
        resolve('Mongodb connected!');
      });
    });
  }
}

export {MongoConnects, connection};
