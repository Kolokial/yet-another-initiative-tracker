export interface CreateUserRequest {
  DisplayName: string;
}

export interface CreateUserResponse {}

export interface ReadUserRequest {}

export interface ReadUserResponse {
  DisplayName: string;
}

export interface UpdateUserRequest {
  DisplayName: string;
}

export interface UpdateUserResponse {}

/* TODO: Delete accounts */
//export interface DeleteUserRequest {}
//export interface DeleteUserResponse {}
