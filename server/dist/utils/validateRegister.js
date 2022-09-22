"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (options.email.length <= 2 || !options.email.includes("@")) {
        return [{
                field: 'email',
                message: "Invalid email."
            }];
    }
    if (options.username.length <= 2) {
        return [{
                field: 'username',
                message: "Username length must be greater than 2 characters."
            }];
    }
    if (options.username.includes("@")) {
        return [{
                field: 'username',
                message: "Username may not contain '@' symbol."
            }];
    }
    if (options.password.length <= 6) {
        return [{
                field: 'password',
                message: "Password length must be greater than 6 characters."
            }];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map