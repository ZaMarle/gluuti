var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Use(async (context, next) =>
{
    var userId = context.Request.Headers["X-User-Id"].FirstOrDefault();
    if (string.IsNullOrEmpty(userId))
    {
        context.Response.StatusCode = 401;
        return;
    }
    await next();
});

app.Run();
