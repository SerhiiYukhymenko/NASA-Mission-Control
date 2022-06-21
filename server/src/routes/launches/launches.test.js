const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  describe('Test POST /launches', () => {
    const testLaunch = {
      mission: 'ZTM155',
      rocket: 'Test Rocket 777',
      target: 'Kepler-442 b',
      launchDate: 'January 17,2030',
    };

    const noDateTestLaunch = {
      mission: 'ZTM155',
      rocket: 'Test Rocket 777',
      target: 'Kepler-442 b',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(testLaunch)
        .expect(201)
        .expect('Content-Type', /json/);

      const requestDate = new Date(testLaunch.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(noDateTestLaunch);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(noDateTestLaunch)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toStrictEqual({ error: 'Missing required launch property' });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send({
          mission: 'ZTM155',
          rocket: 'Test Rocket 777',
          target: 'Kepler-442 b',
          launchDate: 'FalseDate',
        })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toStrictEqual({ error: 'Invalid launch date' });
    });
  });
});
