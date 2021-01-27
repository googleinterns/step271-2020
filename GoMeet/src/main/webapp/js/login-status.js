class LoginStatus {
  static async doGet(servlet) {
    let promise = await fetch(servlet).then(response => response.json());
    return promise; 
  }
}
