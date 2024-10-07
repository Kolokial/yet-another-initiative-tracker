export interface CreateUserRequest {
  displayName: string;
}

export interface CreateUserResponse {}

export interface ReadUserRequest {}

export interface ReadUserResponse {
  displayName: string;
}

export interface UpdateUserRequest {
  displayName: string;
}

export interface UpdateUserResponse {}

/* TODO: Delete accounts */
//export interface DeleteUserRequest {}
//export interface DeleteUserResponse {}
