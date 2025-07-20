using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace UI.Wings.React.Controllers
{
    [Route("api/v1/info")]
    public class InformationController : Controller
    {
        /// <summary>
        /// Get assembly version
        /// </summary>
        /// <remarks>
        /// This endpoint will return the assembly version of this repo.
        /// </remarks>
        /// <returns></returns>
        [HttpGet("version")]
        public IActionResult GetAssemblyVersion()
        {
            return Ok(Assembly.GetExecutingAssembly()?
                              .GetName()
                              .Version
                              .ToString() ?? "Unknown");
        }
    }
}
