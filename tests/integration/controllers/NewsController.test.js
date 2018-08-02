const request = require('supertest');
const urlencode = require('urlencode');
// const assert = require('assert');
const SeqModels = require('../../../seqModels');

let agent;
// let newsId;

const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';
const testUsername = '陈博士的AI';

const testEventName = '陈博女装';

describe.skip('NewsController', function() {
  before(async function() {
    agent = request.agent(sails.hooks.http.app);

    global.sequelize.query(`DELETE FROM news`);
    global.sequelize.query(`DELETE FROM event`);
    global.sequelize.query(`DELETE FROM client`);

    await SeqModels.Event.create({
      name: testEventName,
      description: '浪潮今天上线',
      status: 'admitted',
    });

    await agent
      .post('/client/register')
      .send({
        username: testUsername,
        password: 'testPassword',
        email: testEmail,
      });

    const client = await SeqModels.Client.findOne({
      where: {
        username: testUsername,
      },
    });

    client.role = 'manager';
    await client.save();

    await agent
      .post('/client/login')
      .send({
        username: testUsername,
        password: 'testPassword',
      });
  });

  it('should return 404', async function() {
    await agent
      .post(`/event/${urlencode(testEventName + '吗？')}/news`)
      .send({
        url: 'https://langchao.co',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(404);
  });
});
