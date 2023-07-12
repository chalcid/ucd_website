import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://sfg.taxonworks.org/api/v1/'
});

export default instance;