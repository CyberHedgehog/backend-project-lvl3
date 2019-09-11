import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loader from '../src/loader';

const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const vars = {};

beforeEach(async () => {
  vars.tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
  vars.testFilePath = '__tests__/__fixtures__/file.html';
  vars.testFileContent = await fs.readFile(vars.testFilePath, 'utf-8');
});

test('Work', async (done) => {
  nock(host)
    .get('/page')
    .reply(200, vars.testFileContent);

  await loader(`${host}/page`, vars.tmpDirectory);
  const newFileContent = await fs.readFile(path.join(vars.tmpDirectory, 'localhost-page.html'), 'utf-8');
  expect(newFileContent).toBe(vars.testFileContent);
  done();
});

test('Work on main page', async (done) => {
  nock(host)
    .get('/')
    .reply(200, vars.testFileContent);

  await loader(`${host}`, vars.tmpDirectory);
  const newFileContent = await fs.readFile(path.join(vars.tmpDirectory, 'localhost.html'), 'utf-8');
  expect(newFileContent).toBe(vars.testFileContent);
  done();
});
