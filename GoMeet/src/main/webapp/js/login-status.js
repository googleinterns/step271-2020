class LoginStatus {
  
  static endpoint = '/user-status'; 

  static async doGet() {
    let promise = await fetch(LoginStatus.endpoint).then(response => response.json());
    return promise; 
  }
}
