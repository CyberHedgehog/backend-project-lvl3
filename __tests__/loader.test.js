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

// test.each([
//   ['/', 'localhost.html'],
//   ['/page', 'localhost-page.html'],
// ])(
//   'Should work',
//   async (link, fileName, done) => {
//     const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
//     const testFilePath = '__tests__/__fixtures__/page.html';
//     const testFileContent = await fs.readFile(testFilePath, 'utf-8');
//     nock(host)
//       .get(link)
//       .reply(200, testFileContent);
//     await loader(`${host}${link}`, tmpDirectory);
//     const newFileContent = await fs.readFile(path.join(tmpDirectory, fileName), 'utf-8');
//     expect(newFileContent).toBe(testFileContent);
//     done();
//   },
// );
const fixturesDir = '__tests__/__fixtures__/';

test('Should work with links', async (done) => {
  const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
  const testFilePath = path.join(fixturesDir, 'page.html');
  const testFilesDir = path.join(fixturesDir, 'files');
  const testFileContent = await fs.readFile(testFilePath, 'utf-8');
  nock(host)
    .get('/')
    .reply(200, testFileContent)
    .get('/files/logo.png')
    .reply(200, await fs.readFile(`${testFilesDir}/logo.png`))
    .get('/files/style.css')
    .reply(200, await fs.readFile(`${testFilesDir}/style.css`))
    .get('/files/script.scr')
    .reply(200, await fs.readFile(`${testFilesDir}/script.scr`));

  await loader(host, tmpDirectory);
  const tmpFilesList = await fs.readdir(path.join(tmpDirectory, 'localhost_files'));
  const filesList = await fs.readdir(testFilesDir);
  console.log(filesList);
  expect(tmpFilesList).toContain('files-logo.png');
  done();
});
