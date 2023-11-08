using System.ComponentModel.DataAnnotations;

namespace Mowrer.Fantasky.Api.Models;

public class SimpleTask
{
    public long Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; }
    public bool Completed { get; set; }
    [Timestamp]
    public byte[] Timestamp { get; set; }
}
