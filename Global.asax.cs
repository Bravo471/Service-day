using System;
using System.Web;
using System.Web.Routing;

namespace ServiceDayBackend
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var path = Context.Request.Url?.AbsolutePath ?? "/";
            if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
            {
                RouteConfig.Execute(Context);
            }
        }
    }
}
