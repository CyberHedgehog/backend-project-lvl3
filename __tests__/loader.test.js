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

const fixturesDir = '__tests__/__fixtures__/';
const testFilePath = path.join(fixturesDir, 'page.html');
const testFilesDir = path.join(fixturesDir, 'files');

beforeEach(async () => {
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
});

test('Donwload files', async (done) => {
  const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
  await loader(host, tmpDirectory);
  const tmpFilesList = await fs.readdir(path.join(tmpDirectory, 'localhost_files'));
  expect(tmpFilesList).toContain('files-logo.png');
  done();
});
