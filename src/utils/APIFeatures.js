class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludesFields = ['page', 'sort', 'limit', 'fields'];

    excludesFields.forEach((field) => delete queryObj[field]);

    // 1B-Advance Filtering

    let stringQuery = JSON.stringify(queryObj);

    stringQuery = stringQuery.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(stringQuery));

    return this;
    // let query = Tour.find(JSON.parse(stringQuery));
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();

    //   if (skip >= numTours) {
    //     throw new Error('This page does not exist');
    //   }
    // }
    return this;
  }
}

module.exports = APIFeatures;
