import { removeMongoContainer } from './docker';

export default async () => {
  await removeMongoContainer();
};
