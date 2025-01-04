namespace YAIT.MessageContracts;

public interface Envelope<T>
{
    public string auth0Id { get; set; }
    public T message { get; set; }
    public DateTime dateStamp { get; set; }
}
