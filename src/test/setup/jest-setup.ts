import { CONTAINER_NAME, isContainerRunning, setupMongoContainer } from './docker';

export const testDatabaseConfig = {
  user: 'test',
  password: 'test',
  port: '27018',
  database: 'testdb'
};

export default async () => {
  const isRunning = await isContainerRunning(CONTAINER_NAME);
  if (!isRunning) {
    await setupMongoContainer(
      testDatabaseConfig.user,
      testDatabaseConfig.password,
      testDatabaseConfig.port
    );
  }
};
