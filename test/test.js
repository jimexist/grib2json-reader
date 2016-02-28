import chai from 'chai';
import reader from '../lib/index.js';
import testData from './gfs.2016022500.json';

const expect = chai.expect;

describe('reader', () => {
  it('reads data', () => {
    const { field, grid, date, dataSource } = reader(testData);
    expect(field).to.be.a('function');
    expect(grid).to.be.an('array');
    expect(date).to.be.a('date');
    expect(dataSource).to.be.a('string');
  });
});
