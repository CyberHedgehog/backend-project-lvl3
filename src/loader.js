import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';

const urlToName = (link) => {
  const parsedLink = url.parse(link);
  const linkPath = parsedLink.path === '/' ? '' : parsedLink.path;
  const { host } = parsedLink;
  const fileName = `${host}${linkPath}`.replace(/\W/g, '-');
  return `${fileName}`;
};

const tagsList = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const makePromise = (filesDir, link, tag) => {
  const { name, attribs } = tag;
  const tagLink = attribs[tagsList[name]];
  const fileName = tagLink.replace(/\//g, '-');
  const downloadLink = url.resolve(link, tagLink);
  const filePath = path.join(filesDir, fileName);
  const newTagLink = path.join(path.parse(filesDir).base, fileName);
  attribs[tagsList[name]] = newTagLink;
  return axios.get(downloadLink, {
    responseType: 'arraybuffer',
  })
    .then((res) => fs.writeFile(filePath, res.data));
};

const loadPage = (srcLink, outDir) => axios.get(srcLink)
  .then((res) => {
    const dom = cheerio.load(res.data);
    const pageName = urlToName(srcLink);
    const pagePath = path.join(outDir, `${pageName}.html`);
    const filesDirPath = path.join(outDir, `${pageName}_files`);
    const tags = dom('img, link, script');
    const promisesList = [];
    tags
      .filter((i, el) => el.attribs[tagsList[el.name]])
      .each((i, el) => {
        const newPromise = makePromise(filesDirPath, srcLink, el);
        promisesList.push(newPromise);
      });
    return fs.mkdir(filesDirPath)
      .then(() => Promise.all(promisesList)
        .then(() => fs.writeFile(pagePath, dom.html())));
  });

export default loadPage;
