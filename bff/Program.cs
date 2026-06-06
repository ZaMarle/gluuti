using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        // Return status codes instead of redirecting — the SPA handles navigation
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
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Redirect browser to Nexus login UI with our callback URL as the return address
app.MapGet("/auth/login", (IConfiguration config) =>
{
    var nexusUiUrl = config["Nexus:UiUrl"];
    var callbackUrl = config["Bff:CallbackUrl"];
    return Results.Redirect($"{nexusUiUrl}?redirect={Uri.EscapeDataString(callbackUrl!)}");
});

// Nexus redirects here after login with the JWT in the query string
app.MapGet("/auth/callback", async (
    string token,
    HttpContext httpContext,
    IHttpClientFactory httpClientFactory,
    IConfiguration config) =>
{
    var nexusApiUrl = config["Nexus:ApiUrl"];
    var uiUrl = config["Bff:UiUrl"];

    // Fetch Nexus's public keys so we can verify the token signature
    var http = httpClientFactory.CreateClient();
    string jwksJson;
    try
    {
        jwksJson = await http.GetStringAsync($"{nexusApiUrl}/.well-known/jwks.json");
    }
    catch
    {
        return Results.Redirect($"{uiUrl}?auth_error=nexus_unavailable");
    }

    var jwks = new JsonWebKeySet(jwksJson);
    var handler = new JwtSecurityTokenHandler();
    var validationParams = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKeys = jwks.Keys,
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30),
    };

    ClaimsPrincipal principal;
    try
    {
        principal = handler.ValidateToken(token, validationParams, out _);
    }
    catch
    {
        return Results.Redirect($"{uiUrl}?auth_error=invalid_token");
    }

    // Build a new identity from the JWT claims, plus the raw token so the proxy
    // can attach it as a Bearer header when forwarding requests to the API
    var identity = new ClaimsIdentity(
        principal.Claims.Append(new Claim("access_token", token)),
        CookieAuthenticationDefaults.AuthenticationScheme);

    await httpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(identity));

    return Results.Redirect(uiUrl!);
});

app.Run();
