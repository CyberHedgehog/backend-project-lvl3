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

test('Work', async (done) => {
  const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
  const testFilePath = '__tests__/__fixtures__/file.html';
  const testFileContent = await fs.readFile(testFilePath, 'utf-8');

  nock(host)
    .get('/page')
    .reply(200, testFileContent);

  await loader(`${host}/page`, tmpDirectory);
  const newFileContent = await fs.readFile(path.join(tmpDirectory, 'localhost-page.html'), 'utf-8');
  expect(newFileContent).toBe(testFileContent);
  done();
});
