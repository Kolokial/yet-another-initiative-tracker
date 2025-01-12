public class CreateUserRequest
{
    public required string Auth0Id { get; set; }
    public string? DisplayName { get; set; }
}

public class UpdateUserRequest
{
    public string DisplayName { get; set; }
}