const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function() {
    // FIXME: write real tests!
    const result = sqlForPartialUpdate(
      'jobs',
      { something: 'something', notebook: 'ryan' },
      'name',
      13
    );
    expect(Object.keys(result)).toEqual(['query', 'values']);
    expect(result.query).toEqual(
      'UPDATE jobs SET something=$1, notebook=$2 WHERE name=$3 RETURNING *'
    );
    expect(result.values).toEqual(['something', 'ryan', 13]);
  });
});
