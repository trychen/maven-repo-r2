export enum Permission {
    None = "none",
    Read = "read",
    ReadWrite = "read-write",
}

export class User {
    name: string
    password: string
    permission: Permission
    base64: string

    constructor(name: string, password: string, permission: Permission) {
        this.name = name;
        this.password = password;
        this.permission = permission;
        let baseAuth = `${name}:${password}`;
        this.base64 = btoa(baseAuth);
    }
}

let anonymousUser = new User("default", "", Permission.None);
export const users: [User] = [
    new User("test", "123", Permission.ReadWrite),
]

export function auth(request: Request): User {
    const header = request.headers.get("Authorization");
    if (header == null) {
        return anonymousUser;
    }

    const base64 = header.substring(6);
    const user = users.find((user) => user.base64 == base64);
    if (!user) {
        return anonymousUser;
    }
    return user;
}