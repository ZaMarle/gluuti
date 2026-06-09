using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = 401;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = 403;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/auth/login", (IConfiguration config, IMemoryCache cache) =>
{
    var state = Base64UrlEncode(RandomNumberGenerator.GetBytes(16));
    var codeVerifier = Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
    var codeChallenge = Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier)));

    cache.Set($"pkce:{state}", codeVerifier, TimeSpan.FromMinutes(5));

    var nexusUiUrl = config["Nexus:UiUrl"];
    var callbackUrl = config["Bff:CallbackUrl"];
    var clientId = config["Bff:ClientId"] ?? "gluuti-bff";

    var qs = HttpUtility.ParseQueryString(string.Empty);
    qs["response_type"] = "code";
    qs["client_id"] = clientId;
    qs["redirect_uri"] = callbackUrl!;
    qs["state"] = state;
    qs["code_challenge"] = codeChallenge;
    qs["code_challenge_method"] = "S256";

    return Results.Redirect($"{nexusUiUrl}?{qs}");
});

app.MapGet(
    "/auth/callback",
    async (
        string code,
        string state,
        IConfiguration config,
        IMemoryCache cache,
        IHttpClientFactory httpClientFactory,
        HttpContext ctx) =>
{
    if (!cache.TryGetValue($"pkce:{state}", out string? codeVerifier))
        return Results.BadRequest("Invalid or expired state.");
    cache.Remove($"pkce:{state}");

    var nexusApiUrl = config["Nexus:ApiUrl"];
    var callbackUrl = config["Bff:CallbackUrl"];
    var clientId = config["Bff:ClientId"] ?? "gluuti-bff";

    var client = httpClientFactory.CreateClient();
    var tokenResponse = await client.PostAsJsonAsync($"{nexusApiUrl}/oauth/token", new
    {
        grantType = "authorization_code",
        code,
        redirectUri = callbackUrl,
        clientId,
        codeVerifier
    });

    if (!tokenResponse.IsSuccessStatusCode)
        return Results.Problem("Code exchange failed.");

    var user = await tokenResponse.Content.ReadFromJsonAsync<UserInfo>();
    if (user is null)
        return Results.Problem("Invalid response from auth server.");

    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Name, user.Name),
        new(ClaimTypes.Email, user.Email),
    };
    await ctx.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));

    return Results.Redirect(config["Bff:UiUrl"] ?? "http://localhost:5173");
});

app.MapGet("/auth/me", (HttpContext ctx) => Results.Ok(new
{
    id = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier),
    name = ctx.User.FindFirstValue(ClaimTypes.Name),
    email = ctx.User.FindFirstValue(ClaimTypes.Email),
})).RequireAuthorization();

app.MapPost("/auth/logout", async (HttpContext ctx) =>
{
    await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.Ok();
});

app.Map("/api/{**path}", async (HttpContext ctx, IHttpClientFactory httpClientFactory, IConfiguration config) =>
{
    var downstreamBase = config["DownstreamApi:BaseUrl"]!;
    var request = new HttpRequestMessage
    {
        Method = new HttpMethod(ctx.Request.Method),
        RequestUri = new Uri($"{downstreamBase}{ctx.Request.Path}{ctx.Request.QueryString}"),
    };

    request.Headers.Add("X-User-Id", ctx.User.FindFirstValue(ClaimTypes.NameIdentifier));
    request.Headers.Add("X-User-Email", ctx.User.FindFirstValue(ClaimTypes.Email));

    if (ctx.Request.ContentLength > 0)
    {
        request.Content = new StreamContent(ctx.Request.Body);
        if (ctx.Request.ContentType is not null)
            request.Content.Headers.ContentType =
                System.Net.Http.Headers.MediaTypeHeaderValue.Parse(ctx.Request.ContentType);
    }

    var client = httpClientFactory.CreateClient();
    var response = await client.SendAsync(request);

    ctx.Response.StatusCode = (int)response.StatusCode;
    await response.Content.CopyToAsync(ctx.Response.Body);
}).RequireAuthorization();

app.Run();

static string Base64UrlEncode(byte[] bytes) =>
    Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

record UserInfo(Guid Id, string Name, string Email);
