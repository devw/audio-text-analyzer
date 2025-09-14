require('dotenv').config();
const path = require('path');

module.exports = {
  INPUT_DIR: path.resolve(process.env.INPUT_DIR || 'data/input'),
  OUTPUT_DIR: path.resolve(process.env.OUTPUT_DIR || 'data/output'),
  VENV_PATH: path.resolve(process.env.VENV_PATH || 'venv'),
  DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'auto'
};
