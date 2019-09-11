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

// const vars = {};
// beforeAll(async () => {
//   vars.tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
//   vars.testFilePath = '__tests__/__fixtures__/file.html';
//   vars.testFileContent = await fs.readFile(vars.testFilePath, 'utf-8');
//   nock(host)
//     .get('/page')
//     .reply(200, vars.testFileContent)
//     .get('/')
//     .reply(200, vars.testFileContent);
// });

// test('Work', async (done) => {
//   await loader(`${host}/page`, vars.tmpDirectory);
//   const newFileContent = await fs.readFile(path.join(vars.tmpDirectory, 'localhost-page.html'), 'utf-8');
//   expect(newFileContent).toBe(vars.testFileContent);
//   done();
// });

// test('Work on main page', async (done) => {
//   await loader(`${host}`, vars.tmpDirectory);
//   const newFileContent = await fs.readFile(path.join(vars.tmpDirectory, 'localhost.html'), 'utf-8');
//   expect(newFileContent).toBe(vars.testFileContent);
//   done();
// });

test.each([
  ['/', 'localhost.html'],
  ['/page', 'localhost-page.html'],
])(
  'Should work',
  async (link, fileName, done) => {
    const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
    const testFilePath = '__tests__/__fixtures__/file.html';
    const testFileContent = await fs.readFile(testFilePath, 'utf-8');
    nock(host)
      .get(link)
      .reply(200, testFileContent);
    await loader(`${host}${link}`, tmpDirectory);
    const newFileContent = await fs.readFile(path.join(tmpDirectory, fileName), 'utf-8');
    expect(newFileContent).toBe(testFileContent);
    done();
  },
);
