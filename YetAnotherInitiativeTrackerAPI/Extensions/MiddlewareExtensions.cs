public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseAppMiddleware(this IApplicationBuilder app)
    {
        var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();

        if (env.IsDevelopment())
        {
            Console.WriteLine("is dev mode");
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "YAIT v1");
            });
        }
        return app;
    }

}