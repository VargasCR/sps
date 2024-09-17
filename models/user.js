

class User {
    
    id = '';
    username = '';
    password = '';
    email = '';

    constructor( username,password,email,id ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

module.exports = User;
