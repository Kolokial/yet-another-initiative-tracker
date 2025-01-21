namespace YAIT.MessageContracts;

public class ResponseBase
{
    public DateTime dateStamp { get; set; }
    public string? errorMessage { get; set; }
}
