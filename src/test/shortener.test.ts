/*eslint-disable sonarjs/no-duplicate-string */
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

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it('should return a single url', async () => {
    const res = await factory.app
      .post('/urls')
      .send({ originalUrl: 'https://www.test.com?id=test' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');

    const urlId = res.body.data.id;
    const res2 = await factory.app.get(`/urls/${urlId}`);

    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty('originalUrl', 'https://www.test.com?id=test');
    expect(res2.body).toHaveProperty('shortUrl');
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

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it('should save url and return a new shortened url', async () => {
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

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Original URL already exists');
    expect(response.body.data).toHaveProperty('shortUrl');
  });

  it('should return an error if custom name already exists', async () => {
    const originalUrl = 'https://www.test.example.com';
    const customName = 'example';
    const res1 = await factory.app.post('/urls').send({ originalUrl, customName });
    expect(res1.status).toBe(200);

    const response = await factory.app
      .post('/urls')
      .send({ originalUrl: `${originalUrl}?id=example`, customName });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Custom name already in use');
  });
});

describe('DELETE /urls/:id', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
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
    const res = await factory.app.post('/urls').send({ originalUrl: 'https://www.example123.com' });
    const urlId = res.body.data.id;
    expect(res.status).toBe(200);

    const response = await factory.app.delete(`/urls/${urlId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'URL deleted successfully');
    expect(response.body.data).toHaveProperty('originalUrl', 'https://www.example123.com');
  });
});

describe('PUT /urls/:id', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  // Check for less than 5 characters in customName
  // Check for invalid URL
  it('should update a single url', async () => {
    const originalUrl = 'https://www.example1.com';
    const res1 = await factory.app.post('/urls').send({ originalUrl });
    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveProperty('id');

    const urlId = res1.body.data.id;
    const updatedUrl = 'https://www.updatedurl.com';
    const res2 = await factory.app
      .put(`/urls/${urlId}`)
      .send({ originalUrl: updatedUrl });

    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty('message', 'URL updated successfully');
    expect(res2.body.data.originalUrl).toBe(updatedUrl);
  });

  it('should return an error if the url id does not exist', async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await factory.app
      .put(`/urls/${nonExistingId}`)
      .send({ originalUrl: 'https://www.updatedurl.com' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'URL not found');
  });

  it('should return an error if the request body is invalid', async () => {
    const originalUrl = 'https://www.example2.com';
    const res1 = await factory.app.post('/urls').send({ originalUrl });
    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveProperty('id');

    const urlId = res1.body.data.id;
    // no originalUrl or customName
    const res2 = await factory.app
      .put(`/urls/${urlId}`)
      .send({ invalidField: 'invalid' });

    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('error');

    // Check for less than 5 characters in customName
    const res3 = await factory.app
      .put(`/urls/${urlId}`)
      .send({ originalUrl, customName: 'test' });
    expect(res3.status).toBe(400);

    // Check for invalid URL
    const res4 = await factory.app
      .put(`/urls/${urlId}`)
      .send({ originalUrl: 'invalidurl' });
    expect(res4.status).toBe(400);
  });

  it('should return an error if custom name already exists', async () => {
    const originalUrl1 = 'https://www.test.example3.com';
    const customName = 'example3';

    // Create a URL with the customName
    const res1 = await factory.app.post('/urls').send({ originalUrl: originalUrl1, customName });
    expect(res1.status).toBe(200);

    const res2 = await factory.app.post('/urls').send({ originalUrl: `${originalUrl1}?id=people` });
    expect(res2.status).toBe(200);

    // Attempt to update the URL with the same custom name
    const urlId = res2.body.data.id;
    const res3 = await factory.app
      .put(`/urls/${urlId}`)
      .send({ customName });
    expect(res3.status).toBe(400);
    expect(res3.body).toHaveProperty('error', 'Custom name already exists');
  });
});
