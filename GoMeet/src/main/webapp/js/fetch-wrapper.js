/** Wraps the fetch function. */
class FetchWrapper {

  constructor() {};

  async doPost(servlet, params) {
    let response = await fetch(servlet, {method: 'POST', body: params});
    return response;
  }

  async doGet(servlet) {
    let response = await fetch(servlet);
    return response;
  }
}
