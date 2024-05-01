import mongoose from 'mongoose';

import { TestFactory } from './factory';

describe('Shortener', () => {
  describe('GET /urls', () => {
    const factory: TestFactory = new TestFactory();

    beforeEach((done) => {
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

describe('GET /urls/:id', () => {
  const factory: TestFactory = new TestFactory();
  let urlId: string;

  beforeEach(async () => {
    await factory.init();
    const { body } = await factory.app
      .post('/urls')
      .send({ originalUrl: 'https://www.google.com' });
    urlId = body._id;
  });

  afterEach(async () => {
    await factory.close();
  });

  it('should return a single url', async () => {
    // Retrieve the created URL
    const response = await factory.app.get(`/urls/${urlId}`);

    // Check the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('originalUrl', 'https://www.google.com');
  });

  it('should return an error if the url does not exist', async () => {
    // Generate a non-existing URL ID
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    // Retrieve a URL with the non-existing ID
    const response = await factory.app.get(`/urls/${nonExistingId}`);

    // Check the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'url not found' });
  });
});

describe('POST /urls', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
  });

  it('should save url and return a new shortened url', async () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    const originalUrl = 'https://www.example.com';
    const response = await factory.app.post('/urls').send({ originalUrl });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'URL shortened successfully');
    expect(response.body.data).toHaveProperty('shortUrl');
  });

  it('should return an error if the request body is invalid', async () => {
    const response = await factory.app.post('/urls').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');

    // Check if the error messages match the expected messages
    const expectedErrorMessages = [
      { location: 'body', msg: 'URL should be a valid URL', path: 'originalUrl', type: 'field' },
      { location: 'body', msg: 'URL should be a valid URL', path: 'originalUrl', type: 'field' }
    ];
    expect(response.body.errors).toEqual(expect.arrayContaining(expectedErrorMessages));
  });

  it('should return the right message if original url already exists', async () => {
    const originalUrl = 'https://www.example.com';
    await factory.app.post('/urls').send({ originalUrl });

    const response = await factory.app.post('/urls').send({ originalUrl });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Original URL already exists');
    expect(response.body.data).toHaveProperty('shortUrl');
  });

  it('should return an error if custom name already exists', async () => {
    const originalUrl = 'https://www.example.com';
    const customName = 'example';
    await factory.app.post('/urls').send({ originalUrl, customName });

    const response = await factory.app.post('/urls').send({ originalUrl, customName });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Custom name already in use');
  });
});

describe('DELETE /urls/:id', () => {
  const factory: TestFactory = new TestFactory();

  let urlId: string;

  beforeEach(async () => {
    await factory.init();
    const { body } = await factory.app
      .post('/urls')
      .send({ originalUrl: 'https://www.example.com' });
    urlId = body._id;
  });

  afterEach(async () => {
    await factory.close();
  });

  it('should return a 400 error for an invalid id format', async () => {
    const response = await factory.app.delete('/urls/invalidId');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid ID format' });
  });

  it('should return a 404 error for a non-existing id', async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await factory.app.delete(`/urls/${nonExistingId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Original URL not found' });
  });

  it('should delete the url and return the deleted url details', async () => {
    const response = await factory.app.delete(`/urls/${urlId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'URL deleted successfully');
    expect(response.body.data).toHaveProperty('originalUrl', 'https://www.example.com');
  });
});
