import { TestFactory } from './factory';

describe('Shortener', () => {
  describe('GET /urls', () => {
    const factory: TestFactory = new TestFactory();

    beforeEach( (done) => {
      factory.init().then(done);
    });

    afterEach((done) => {
      factory.close().then(done);
    });

    it('should return an empty array of urls', async () => {
      const response = await factory.app.get('/urls');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an array of urls', async () => {
      await factory.app.post('/urls').send({ originalUrl: 'https://www.google.com' });
      const response = await factory.app.get('/urls');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });
  });
});
