using Microsoft.EntityFrameworkCore;
using Mowrer.Fantasky.Api.Models;

namespace Mowrer.Fantasky.Api;

public class Context : DbContext
{
    public Context(DbContextOptions options) : base(options)
    {
    }

    public DbSet<SimpleTask> SimpleTasks { get; set; }
}
