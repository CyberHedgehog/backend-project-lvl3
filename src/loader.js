import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';

const log = debug('page-loader');

const getFileName = (link) => {
  const parsedLink = url.parse(link);
  const linkPath = parsedLink.path === '/' ? '' : parsedLink.path;
  const { host } = parsedLink;
  const fileName = `${host}${linkPath}`.replace(/\W/g, '-');
  return fileName;
};

const tagsList = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const downloadFile = (downloadPath, downloadLink) => {
  log(`Downloading file: ${downloadLink}`);
  return axios.get(downloadLink, {
    responseType: 'arraybuffer',
  })
    .then((res) => fs.writeFile(downloadPath, res.data));
};

const getDownloadsList = (dom, link, destDir) => {
  const tags = dom(Object.keys(tagsList).join(','));
  const downloadsList = [];
  log('Creating downloads list');
  tags
    .filter((i, el) => el.attribs[tagsList[el.name]])
    .each((i, el) => {
      const { name, attribs } = el;
      const fileLink = attribs[tagsList[name]];
      const fileName = fileLink.replace(/\//g, '-');
      const downloadLink = url.resolve(link, fileLink);
      const filePath = path.join(destDir, fileName);
      attribs[tagsList[name]] = path.join(path.parse(destDir).base, fileName);
      downloadsList.push({ downloadLink, filePath });
    });
  return downloadsList;
};

const downloadFiles = (downloadsList) => {
  const promisesList = downloadsList.map((elem) => {
    const { downloadLink, filePath } = elem;
    return downloadFile(filePath, downloadLink);
  });
  return Promise.all(promisesList);
};

const loadPage = (srcLink, outDir) => {
  let dom;
  const pageName = getFileName(srcLink);
  const pagePath = path.join(outDir, `${pageName}.html`);
  const filesDirPath = path.join(outDir, `${pageName}_files`);
  log(`Downloading page: ${srcLink}`);
  return axios.get(srcLink)
    .catch((err) => {
      const { response } = err;
      if (!response) {
        throw (new Error(err.code));
      }
      throw (new Error(response.status));
    })
    .then((res) => {
      dom = cheerio.load(res.data);
      return fs.mkdir(filesDirPath)
        .catch((err) => {
          throw (new Error(err.code));
        });
    })
    .then(() => {
      const downloadsList = getDownloadsList(dom, srcLink, filesDirPath);
      return downloadFiles(downloadsList);
    })
    .then(() => fs.writeFile(pagePath, dom.html()));
};

export default loadPage;
