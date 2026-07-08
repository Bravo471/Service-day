using System.Collections.Generic;
using System.Web;
using System.Web.Script.Serialization;
using ServiceDayBackend.Models;

namespace ServiceDayBackend.Controllers
{
    public class ServiceController
    {
        private readonly List<ServiceItem> _items = new List<ServiceItem>
        {
            new ServiceItem { Id = 1, Name = "Food Drive", Description = "Pack and distribute food to families in need." },
            new ServiceItem { Id = 2, Name = "Tree Planting", Description = "Plant trees in the local community park." }
        };

        public void HandleRequest(HttpContext context, string id)
        {
            context.Response.ContentType = "application/json";
            var serializer = new JavaScriptSerializer();

            if (context.Request.HttpMethod == "GET")
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    context.Response.Write(serializer.Serialize(_items));
                    return;
                }

                var item = _items.Find(x => x.Id.ToString() == id);
                if (item != null)
                {
                    context.Response.Write(serializer.Serialize(item));
                    return;
                }

                context.Response.StatusCode = 404;
                context.Response.Write(serializer.Serialize(new { message = "Service item not found" }));
                return;
            }

            if (context.Request.HttpMethod == "POST")
            {
                context.Response.StatusCode = 201;
                context.Response.Write(serializer.Serialize(new { message = "Service created successfully" }));
                return;
            }

            context.Response.StatusCode = 405;
            context.Response.Write(serializer.Serialize(new { message = "Method not allowed" }));
        }
    }
}
