using System;
using System.Web.Routing;
using ServiceDayBackend.Controllers;

namespace ServiceDayBackend
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.Ignore("{resource}.axd/{*pathInfo}");
            routes.MapPageRoute("Default", "api/services/{id}", "~/{0}");
            routes.MapPageRoute("Services", "api/services", "~/{0}");
        }

        public static void Execute(HttpContext context)
        {
            var path = context.Request.Url.AbsolutePath.Trim('/');
            var segments = path.Split('/');

            if (segments.Length >= 2 && segments[0] == "api" && segments[1] == "services")
            {
                var id = segments.Length > 2 ? segments[2] : null;
                var controller = new ServiceController();
                controller.HandleRequest(context, id);
                return;
            }

            context.Response.StatusCode = 404;
            context.Response.Write("Not found");
        }
    }
}
