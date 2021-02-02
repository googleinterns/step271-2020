/** Wraps the fetch function. */
class FetchWrapper {

  constructor() {};

  async doPost(servlet, params) {
    return await fetch(servlet, {method: 'POST', body: params});
  }

  async doGet(servlet) {
    let response = await fetch(servlet);
    return response;
  }
}
