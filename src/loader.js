import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const urlToFileName = (link) => {
  const parsedLink = url.parse(link);
  const linkPath = parsedLink.path === '/' ? '' : parsedLink.path;
  const { host } = parsedLink;
  const fileName = `${host}${linkPath}`.replace(/\W/g, '-');
  return `${fileName}.html`;
};

const pageLoader = (srcUrl, dstPath) => axios.get(srcUrl)
  .then((res) => fs.writeFile(path.join(dstPath, urlToFileName(srcUrl)), res.data));

export default pageLoader;
