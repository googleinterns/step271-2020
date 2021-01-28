/** Wraps the fetch function. */
class FetchWrapper {

  constructor() {};

  async doPost(servlet, params) {
    return await fetch(servlet, {method: 'POST', body: params});
  }
}
