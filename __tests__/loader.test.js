import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src/loader';

const host = 'http://localhost';

axios.defaults.adapter = httpAdapter;

const fixturesDir = '__tests__/__fixtures__/';
const testFilePath = path.join(fixturesDir, 'page.html');
const testFilesDir = path.join(fixturesDir, 'files');

beforeEach(async () => {
  const testFileContent = await fs.readFile(testFilePath, 'utf-8');
  nock(host)
    .get('/')
    .reply(200, testFileContent);
});

test('Donwload page', async () => {
  nock(host)
    .get('/files/logo.png')
    .reply(200, await fs.readFile(`${testFilesDir}/logo.png`))
    .get('/files/style.css')
    .reply(200, await fs.readFile(`${testFilesDir}/style.css`))
    .get('/files/script.scr')
    .reply(200, await fs.readFile(`${testFilesDir}/script.scr`));

  const tmpDirectory = await fs.mkdtemp(path.join(tmpdir(), 'pl-'));
  await loadPage(host, tmpDirectory);
  const tmpFilesList = await fs.readdir(path.join(tmpDirectory, 'localhost_files'));
  const downloadedPagePath = path.join(tmpDirectory, 'localhost.html');
  const pageData = await fs.readFile(downloadedPagePath, 'utf-8');
  expect(tmpFilesList).toContain('files-logo.png');
  expect(pageData.includes('localhost_files/files-logo.png')).toBeTruthy();
});

test('Errors', async () => {
  nock(host)
    .get('/epage')
    .replyWithError({
      code: 'ENOTFOUND',
      message: 'Not found',
    })
    .get('/nf')
    .reply(404);
  await expect(loadPage(host, '/')).rejects.toThrow('EACCES');
  await expect(loadPage(`${host}/epage`, '/')).rejects.toThrow('ENOTFOUND');
  await expect(loadPage(`${host}/nf`, '/')).rejects.toThrow('404');
});
