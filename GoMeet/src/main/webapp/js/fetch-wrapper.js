/** Wraps the fetch function. */
class FetchWrapper {

  constructor() {};

  async postLocation(servlet, params) {
    let response = await fetch(servlet, {method: 'POST', body: params});
    return response;
  }
}
