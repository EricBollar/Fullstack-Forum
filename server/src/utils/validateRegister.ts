import { UserLoginInput } from "../utils/types";

export const validateRegister = (options: UserLoginInput) => {
    // check username length
    if (options.email.length <= 2 || !options.email.includes("@")) {
        return [{
            field: 'email',
            message: "Invalid email."
        }] 
    }

    // check username length
    if (options.username.length <= 2) {
        return [{
            field: 'username',
            message: "Username length must be greater than 2 characters."
        }]
    }

    // check username is not email
    if (options.username.includes("@")) {
        return [{
            field: 'username',
            message: "Username may not contain '@' symbol."
        }]
    }

    // check password length
    // may want to add better validation in future
    if (options.password.length <= 6) {
        return [{
            field: 'password',
            message: "Password length must be greater than 6 characters."
        }]
        
    }

    return null;
}